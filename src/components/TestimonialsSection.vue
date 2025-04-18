<script setup>
// Testimonials component
const testimonials = [
  {
    id: 1,
    name: 'uae40uc9c0uc6b0',
    age: 28,
    comment: 'uc804 uc774 uc774ubca4ud2b8ub97c ud1b5ud574 uc800uc758 ud604uc7ac ub0a8uc790uce5cuad6cub97c ub9ccub0acuc5b4uc694! ubd80ub2f4 uc5c6ub294 ub9ccub0a8uc774uc5c8uace0 uc9c4uc9dc uc990uac70uc6e0uc5b4uc694.',
    rating: 5
  },
  {
    id: 2,
    name: 'uc774uc11cuc9c4',
    age: 31,
    comment: 'uc0acub78cuc744 ub9ccub098ub294 uac83uc774 uc5b4ub824uc6e0ub294ub370 uc774ub807uac8c uc880 ub354 uc790uc5f0uc2a4ub7fduac8c uc18cuac1cubc1buc744 uc218 uc788uc5b4uc11c uc88buc558uc5b4uc694.',
    rating: 4
  },
  {
    id: 3,
    name: 'ubc15ubbfcuc218',
    age: 27,
    comment: 'uc0c8ub85cuc6b4 uc0acub78cub4e4uc744 ub9ccub098uace0 uc2f6uc5c8ub294ub370 uc774 uc774ubca4ud2b8uac00 uc815ub9d0 uc88buc740 uae30ud68cuac00 ub418uc5c8uc5b4uc694. ub2e4uc74cuc5d0ub3c4 ubc18ub4dcuc2dc ucc38uc5ecud560uac8cuc694!',
    rating: 5
  }
];
</script>

<template>
  <section class="testimonials">
    <h2 class="section-title">uc774uc804 ucc38uac00uc790 ud6c4uae30</h2>
    
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
              <p>{{ testimonial.age }}uc138</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cta-container">
      <h3>ub2f9uc2e0ub3c4 uc0c8ub85cuc6b4 ub9ccub0a8uc744 ucc3euace0 uc788ub098uc694?</h3>
      <a href="#register" class="cta-button">uc9c0uae08 uc2e0uccadud558uae30</a>
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
