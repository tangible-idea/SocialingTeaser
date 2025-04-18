<script setup>
import { ref } from 'vue';
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <div class="english-title">Tangible Christian Dating</div>
      <h1>특별한 만남의 시작</h1>
      <h2>교회 청년들 모두 다 짝 찾아주자 이벤트</h2>
      
      <div class="intro-text">
        <p>- 저는 대형교회 다니는 평범한 30대 개발자입니다. 주변에 소개시켜달라는 형제,자매분들 많은데 같은 교회에서는 서로 눈치보면서 못만나고, 소개팅은 부담스럽고, 나의 준비하신 인연 어디있는지 모르겠고..</p>
        <p>- 시험공부도 기도만 열심히하고 공부안하면 점수가 오르는게 아니듯이, 배우자기도도 기도만하고 만날 노력을 하지않으면 ㅇㅇㅇ합니다.</p>
        <p>- 이런 친구들이 주변에 많아서 한번 만들어봤습니다. 문뜩 이런 교회 친구들을 전부 모아서 연결해주면 어떨까 생각해봤습니다.</p>
      </div>
      
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

.english-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 1rem;
  letter-spacing: 1px;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.intro-text {
  text-align: left;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem auto 2rem;
  backdrop-filter: blur(10px);
  max-width: 90%;
  line-height: 1.6;
  color: var(--cream);
}

.intro-text p {
  margin-bottom: 1rem;
}

.intro-text p:last-child {
  margin-bottom: 0;
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
  
  .english-title {
    font-size: 1.5rem;
  }
  
  .intro-text {
    font-size: 0.95rem;
    padding: 1.2rem;
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
  .english-title {
    font-size: 1.3rem;
  }
  
  .intro-text {
    font-size: 0.9rem;
    padding: 1rem;
    line-height: 1.5;
  }
  
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
