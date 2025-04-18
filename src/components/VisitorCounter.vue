<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { trackVisitors, subscribeToActiveVisitors } from '../visitor-tracker';

const activeVisitors = ref(0);
let unsubscribe = null;
let cleanupTracker = null;

onMounted(() => {
  // Supabase 방문자 추적 시작
  try {
    // 방문자 추적 시작 - 반환된 정리 함수 저장
    cleanupTracker = trackVisitors();
    
    // 실시간 접속자 수 구독
    unsubscribe = subscribeToActiveVisitors((count) => {
      console.log(`접속자 수 업데이트: ${count}명`);
      activeVisitors.value = count;
    });
  } catch (error) {
    console.error('방문자 추적 초기화 오류:', error);
  }
});

onUnmounted(() => {
  // 구독 해제 (만약 함수가 반환되었다면)
  if (unsubscribe) {
    unsubscribe();
  }
  
  // 방문자 추적 정리 (타이머 정리, 오프라인 상태 업데이트 등)
  if (cleanupTracker) {
    cleanupTracker();
  }
});
</script>

<template>
  <div class="visitor-counter">
    <div class="counter-content">
      <div class="pulse-dot"></div>
      <div class="counter-text">
        <span class="counter-label">현재 방문자:</span>
        <span class="counter-value">{{ activeVisitors }}</span>
        <span class="counter-unit">명</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visitor-counter {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 18px;
  padding: 12px 20px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.visitor-counter:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.counter-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pulse-dot {
  width: 15px;
  height: 15px;
  background-color: #4CAF50;
  border-radius: 50%;
  position: relative;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
  }
  100% {
    transform: scale(0.8);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.counter-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.counter-label {
  font-weight: 500;
}

.counter-value {
  font-weight: 800;
  font-size: 1.8rem;
  color: #4CAF50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.counter-unit {
  font-size: 1rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .visitor-counter {
    padding: 10px 16px;
    font-size: 1rem;
  }
  
  .pulse-dot {
    width: 12px;
    height: 12px;
  }
  
  .counter-value {
    font-size: 1.5rem;
  }
}
</style>
