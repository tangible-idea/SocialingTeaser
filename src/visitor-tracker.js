import supabase from './supabase';

// 만료된 방문자 정리 시간 (초)
const VISITOR_TIMEOUT_SECONDS = 10; // 10초 동안 핑이 없으면 오프라인으로 간주

// 랜덤 방문자 ID 생성 함수
function generateVisitorId() {
  return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 방문자 세션 관리
export const trackVisitors = async () => {
  try {
    // 로컬 스토리지에서 방문자 ID 가져오기 또는 새로 생성
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem('visitor_id', visitorId);
    }

    // 현재 방문자 정보
    const visitorInfo = {
      visitor_id: visitorId,
      online: true,
      last_seen: new Date().toISOString()
    };

    // 방문자 정보 업데이트 또는 생성
    const { error } = await supabase
      .from('visitors')
      .upsert(visitorInfo, { onConflict: 'visitor_id' });

    if (error) throw error;

    //console.log('방문자 상태 업데이트: 온라인');

    // 페이지 종료 시 오프라인 상태로 업데이트하는 이벤트 리스너
    const updateOfflineStatus = async () => {
      try {
        //console.log('방문자 상태 업데이트: 오프라인');
        await supabase
          .from('visitors')
          .update({ online: false })
          .eq('visitor_id', visitorId);
      } catch (err) {
        console.error('오프라인 상태 업데이트 오류:', err);
      }
    };

    // 창 닫기/페이지 이동 이벤트에 오프라인 처리 연결
    window.addEventListener('beforeunload', updateOfflineStatus);
    
    // 주기적으로 방문자 상태 업데이트 (1초마다 핑)
    const pingInterval = setInterval(async () => {
      try {
        await supabase
          .from('visitors')
          .update({ last_seen: new Date().toISOString() })
          .eq('visitor_id', visitorId);
        //console.log('방문자 상태 핑 업데이트');
      } catch (err) {
        console.error('방문자 핑 업데이트 오류:', err);
      }
    }, 1000);

    // 컴포넌트 언마운트 시 인터벌 정리 (Vue 컴포넌트에서 onUnmounted에서 호출하도록 반환)
    return () => {
      clearInterval(pingInterval);
      updateOfflineStatus();
      window.removeEventListener('beforeunload', updateOfflineStatus);
    };

    // 총 방문자 수 업데이트
    await supabase.rpc('increment_visits_count');
  } catch (error) {
    console.error('방문자 추적 오류:', error);
  }
};

// 오래된 방문자 자동 정리 함수 (서버 기능으로 만들어야 함)
async function cleanupStaleVisitors() {
  try {
    // 오래된 시간 계산 (현재 시간에서 VISITOR_TIMEOUT_SECONDS초 이전)
    const cutoffTime = new Date();
    cutoffTime.setSeconds(cutoffTime.getSeconds() - VISITOR_TIMEOUT_SECONDS);
    
    const { data, error } = await supabase
      .from('visitors')
      .update({ online: false })
      .lt('last_seen', cutoffTime.toISOString())
      .eq('online', true);
      
    if (error) {
      console.error('오래된 방문자 정리 오류:', error);
    } else if (data && data.length > 0) {
      console.log(`${data.length}명의 오래된 방문자가 오프라인으로 전환됨`);
    }
  } catch (err) {
    console.error('오래된 방문자 자동 정리 오류:', err);
  }
}

// 현재 접속자 수 구독 함수
export const subscribeToActiveVisitors = (callback) => {
  // 오래된 방문자 정리 주기적 실행 (5초마다)
  const cleanupInterval = setInterval(cleanupStaleVisitors, 5000);

  // 초기 데이터 로드
  const loadInitialCount = async () => {
    try {
      // 현재 접속자(온라인 상태인) 수 카운트
      const { data, error } = await supabase
        .from('visitors')
        .select('visitor_id')
        .eq('online', true);

      if (error) throw error;
      const count = data?.length || 0;
      console.log(`현재 접속자 수: ${count}명`);
      callback(count);
    } catch (error) {
      console.error('초기 접속자 수 로드 오류:', error);
      callback(0);
    }
  };

  // 초기 데이터 로드 실행
  loadInitialCount();
  
  // 최초 로드 시 오래된 방문자 정리
  cleanupStaleVisitors();

  // 실시간 변경사항 구독 - 더 구체적인 이벤트 구독으로 변경
  const channel = supabase
    .channel('public:visitors')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'visitors' }, 
      payload => {
        console.log('새 방문자 감지:', payload);
        loadInitialCount();
      }
    )
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'visitors' }, 
      payload => {
        //console.log('방문자 상태 변경 감지:', payload);
        loadInitialCount();
      }
    )
    .on('postgres_changes', 
      { event: 'DELETE', schema: 'public', table: 'visitors' }, 
      payload => {
        console.log('방문자 삭제 감지:', payload);
        loadInitialCount();
      }
    );
  
  // 채널 구독 시작 및 에러 처리
  channel.subscribe(status => {
    if (status === 'SUBSCRIBED') {
      console.log('Realtime 채널 연결 성공');
    } else {
      console.error('Realtime 채널 연결 상태:', status);
    }
  });

  // 구독 해제 함수 반환
  return () => {
    console.log('Realtime 채널 구독 해제');
    clearInterval(cleanupInterval); // 정리 타이머 중지
    channel.unsubscribe();
  };
};

export default { trackVisitors, subscribeToActiveVisitors };
