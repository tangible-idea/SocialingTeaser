import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Firebase 구성
const firebaseConfig = {
  apiKey: "AIzaSyDX4Rc4cI1wp30fB2lqkq18qhxR6J6U1to",
  authDomain: "dating-8ad83.firebaseapp.com",
  projectId: "dating-8ad83",
  storageBucket: "dating-8ad83.firebasestorage.app",
  messagingSenderId: "226998479560",
  appId: "1:226998479560:web:df3a9d97b5aa49a31793fd",
  measurementId: "G-W638MFBF0K"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default { app, analytics };
