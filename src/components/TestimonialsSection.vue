<script setup>
// Testimonials component
const testimonials = [
  {
    id: 1,
    name: '김지우',
    age: 28,
    comment: '전 이 이벤트를 통해 저의 현재 남자친구를 만났어요! 부담 없는 만남이었고 진짜 즐거웠어요.',
    rating: 5
  },
  {
    id: 2,
    name: '이서진',
    age: 31,
    comment: '사람을 만나는 것이 어려웠는데 이렇게 좀 더 자연스럽게 소개받을 수 있어서 좋았어요.',
    rating: 4
  },
  {
    id: 3,
    name: '박민수',
    age: 27,
    comment: '새로운 사람들을 만나고 싶었는데 이 이벤트가 정말 좋은 기회가 되었어요. 다음에도 반드시 참여할게요!',
    rating: 5
  }
];
</script>

<template>
  <section class="testimonials">
    <h2 class="section-title">이전 참가자 후기</h2>
    
    <div class="testimonials-slider">
      <div class="testimonial-cards">
        <div 
          v-for="testimonial in testimonials" 
          :key="testimonial.id"
          class="testimonial-card"
        >
          <div class="stars">
            <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= testimonial.rating }">
              &#9733;
            </span>
          </div>
          <p class="comment">{{ testimonial.comment }}</p>
          <div class="testimonial-author">
            <div class="author-avatar">
              {{ testimonial.name.charAt(0) }}
            </div>
            <div class="author-info">
              <h4>{{ testimonial.name }}</h4>
              <p>{{ testimonial.age }}세</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cta-container">
      <h3>지금 바로 신청하고 새로운 만남의 기회를 잡으세요! 빠른 신청이 남은 자리를 선착순으로 확보합니다!</h3>
      <a href="#register" class="cta-button">지금 바로 신청하기</a>
    </div>
  </section>
</template>

<style scoped>
.testimonials {
  padding: 5rem 2rem;
  background-color: #f0f0f0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
  position: relative;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #ff6b6b, #794bc4);
  border-radius: 2px;
}

.testimonials-slider {
  max-width: 1000px;
  margin: 0 auto 4rem;
  overflow: hidden;
}

.testimonial-cards {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.testimonial-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  flex: 1;
  min-width: 280px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
}

.stars {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #ddd;
}

.star.filled {
  color: #ffb400;
}

.comment {
  flex-grow: 1;
  font-style: italic;
  line-height: 1.7;
  color: #555;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
}

.author-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #ff6b6b, #794bc4);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  margin-right: 1rem;
}

.author-info h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.author-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #777;
}

.cta-container {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.cta-container h3 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.cta-button {
  display: inline-block;
  background: linear-gradient(135deg, #ff6b6b, #794bc4);
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 1rem 3rem;
  border-radius: 50px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .testimonial-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .testimonial-card {
    width: 100%;
    max-width: 400px;
  }
}
</style>
