<script setup>
import { ref } from 'vue';
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <h1>특별한 만남의 시작</h1>
      <h2>1:1 소셜 데이팅 이벤트</h2>
      <div class="promotion">
        <div class="price-tag">
          <span class="price">5,000원</span>
          <span class="limited">선착순 100명 한정</span>
        </div>
        <p class="regular-price">정상가 15,000원</p>
      </div>
      <!-- 네이버 스마트 스토어로 연결 -->
      <a href="https://smartstore.naver.com/tangible/products/11422139807" target="_blank" class="cta-button">
        <svg class="naver-icon" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H10.2V12H11V4Z" fill="currentColor"/>
          <path d="M5 4H4V12H5L9 7V12H10V4H9L5 9V4Z" fill="currentColor"/>
        </svg>
        네이버에서 구매하기
      </a>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--secondary-brown), var(--dark-brown));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem 1rem;
}

.hero-content {
  max-width: 800px;
  width: 100%;
}

h1 {
  font-size: 3.5rem;
  margin-bottom: 0.5rem;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  color: var(--cream);
}

h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: 400;
  color: var(--cream);
}

.promotion {
  margin: 2rem auto;
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  max-width: 90%;
}

.price-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
}

.price {
  font-size: 3rem;
  font-weight: 800;
  color: var(--light-brown);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.limited {
  font-size: 1.2rem;
  background-color: var(--accent);
  padding: 0.3rem 1rem;
  border-radius: 20px;
  margin-top: 0.5rem;
}

.regular-price {
  font-size: 1.2rem;
  text-decoration: line-through;
  opacity: 0.8;
}

.cta-button {
  background-color: #19ce60; /* 신청하기 버튼 색상 */
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 1rem 3rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-top: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
  background-color: #00b843; /* 신청하기 버튼 호버 색상 */
}

.naver-icon {
  margin-right: 14px;
  font-size: 1.3em;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
    min-height: 90vh;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .price {
    font-size: 2.5rem;
  }
  
  .promotion {
    padding: 1rem;
    margin: 1.5rem auto;
  }
  
  .cta-button {
    font-size: 1.25rem;
    padding: 0.75rem 2rem;
    width: 100%;
    max-width: 300px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 2rem;
  }
  
  h2 {
    font-size: 1.25rem;
  }
  
  .cta-button {
    font-size: 1.25rem;
    padding: 0.75rem 2rem;
    width: 100%;
    max-width: 300px;
  }
}
</style>
