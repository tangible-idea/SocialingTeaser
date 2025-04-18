<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { trackVisitors, subscribeToActiveVisitors } from '../visitor-tracker';

const activeVisitors = ref(0);
let unsubscribe = null;

onMounted(() => {
  // Supabase 방문자 추적 시작
  try {
    // 방문자 추적 시작
    trackVisitors();
    
    // 실시간 접속자 수 구독
    unsubscribe = subscribeToActiveVisitors((count) => {
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
});
</script>

<template>
  <div class="visitor-counter">
    <div class="counter-content">
      <div class="pulse-dot"></div>
      <div class="counter-text">
        <span class="counter-label">실시간 접속자:</span>
        <span class="counter-value">{{ activeVisitors }}</span>
        <span class="counter-unit">명</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visitor-counter {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50px;
  padding: 8px 16px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.visitor-counter:hover {
  background-color: rgba(0, 0, 0, 0.8);
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.counter-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pulse-dot {
  width: 10px;
  height: 10px;
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
  gap: 5px;
}

.counter-label {
  font-weight: 400;
}

.counter-value {
  font-weight: 700;
  font-size: 1.1rem;
}

.counter-unit {
  font-size: 0.85rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .visitor-counter {
    bottom: 15px;
    right: 15px;
    padding: 6px 12px;
    font-size: 0.8rem;
  }
  
  .pulse-dot {
    width: 8px;
    height: 8px;
  }
  
  .counter-value {
    font-size: 1rem;
  }
}
</style>
