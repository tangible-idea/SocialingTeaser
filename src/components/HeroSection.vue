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
      <button class="cta-button">지금 신청하기</button>
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
  background-color: var(--accent);
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
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
  background-color: var(--secondary-brown);
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
