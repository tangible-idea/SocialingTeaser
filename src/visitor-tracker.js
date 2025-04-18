import supabase from './supabase';

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

    // 페이지 종료 시 오프라인 상태로 업데이트하는 이벤트 리스너
    const updateOfflineStatus = async () => {
      try {
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

    // 총 방문자 수 업데이트 (옵션)
    await supabase.rpc('increment_visits_count');
  } catch (error) {
    console.error('방문자 추적 오류:', error);
  }
};

// 현재 접속자 수 구독 함수
export const subscribeToActiveVisitors = (callback) => {
  // 초기 데이터 로드
  const loadInitialCount = async () => {
    try {
      // 현재 접속자(온라인 상태인) 수 카운트
      const { data, error } = await supabase
        .from('visitors')
        .select('visitor_id')
        .eq('online', true);

      if (error) throw error;
      callback(data?.length || 0);
    } catch (error) {
      console.error('초기 접속자 수 로드 오류:', error);
      callback(0);
    }
  };

  // 초기 데이터 로드 실행
  loadInitialCount();

  // 실시간 변경사항 구독
  const subscription = supabase
    .channel('visitors_channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'visitors' }, 
      () => {
        // 테이블에 변경이 감지되면 접속자 수 다시 로드
        loadInitialCount();
      }
    )
    .subscribe();

  // 구독 해제 함수 반환
  return () => {
    subscription.unsubscribe();
  };
};

export default { trackVisitors, subscribeToActiveVisitors };
