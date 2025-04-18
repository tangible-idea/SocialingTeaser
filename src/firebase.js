import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, increment } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

// Firebase 구성
const firebaseConfig = {
  apiKey: "AIzaSyDX4Rc4cI1wp30fB2lqkq18qhxR6J6U1to",
  authDomain: "dating-8ad83.firebaseapp.com",
  projectId: "dating-8ad83",
  storageBucket: "dating-8ad83.firebasestorage.app",
  messagingSenderId: "226998479560",
  appId: "1:226998479560:web:df3a9d97b5aa49a31793fd",
  measurementId: "G-W638MFBF0K",
  databaseURL: "https://dating-8ad83-default-rtdb.firebaseio.com" // 꼭 필요합니다 - Realtime Database URL
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

// 현재 접속자 관리 기능
export const trackVisitors = () => {
  // 사용자 ID 생성 또는 가져오기
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitor_id', visitorId);
  }

  const visitorRef = ref(database, 'visitors/' + visitorId);
  const connectedRef = ref(database, '.info/connected');

  // 연결 상태 모니터링
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // 연결이 활성화되었을 때
      set(visitorRef, {
        online: true,
        timestamp: new Date().toISOString()
      });

      // 연결이 종료될 때 상태 업데이트
      set(visitorRef, { online: false }, { onDisconnect: true });
    }
  });

  // 총 방문자 카운트 증가
  const visitsCountRef = ref(database, 'stats/visits');
  set(visitsCountRef, increment(1));
};

// 현재 접속자 수를 구독하는 함수
export const subscribeToActiveVisitors = (callback) => {
  const visitorsRef = ref(database, 'visitors');
  
  onValue(visitorsRef, (snapshot) => {
    const data = snapshot.val() || {};
    const activeVisitors = Object.values(data).filter(visitor => visitor.online === true).length;
    callback(activeVisitors);
  });
};

export default { trackVisitors, subscribeToActiveVisitors };
