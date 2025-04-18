<script setup>
import { ref } from 'vue';

const formData = ref({
  name: '',
  age: '',
  gender: '',
  phone: '',
  email: '',
  interests: []
});

const interests = [
  '영화',
  '여행',
  '독서',
  '음악',
  '요리',
  '스포츠',
  '게임',
  '춤',
  '예술',
  '패션'
];

const formSubmitted = ref(false);
const errorMessage = ref('');

const submitForm = () => {
  // Basic validation
  if (!formData.value.name || !formData.value.age || !formData.value.gender || !formData.value.phone) {
    errorMessage.value = '모든 필수 정보를 입력해주세요.';
    return;
  }
  
  // In a real app, you would send this data to a server
  console.log('Form submitted:', formData.value);
  formSubmitted.value = true;
  errorMessage.value = '';
};
</script>

<template>
  <section class="registration" id="register">
    <h2 class="section-title">이벤트 신청하기</h2>
    
    <div class="form-container">
      <div v-if="!formSubmitted" class="form-box">
        <h3>선착순 100명 특별가: <span class="price-highlight">5,000원</span></h3>
        <p class="form-subtitle">일반 참가비: 15,000원</p>
        
        <form @submit.prevent="submitForm" class="registration-form">
          <div class="form-group">
            <label for="name">이름 *</label>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name" 
              placeholder="이름을 입력하세요"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="age">나이 *</label>
            <input 
              type="number" 
              id="age" 
              v-model="formData.age" 
              placeholder="나이를 입력하세요"
              min="25"
              max="35"
              required
            />
          </div>
          
          <div class="form-group">
            <label>성별 *</label>
            <div class="radio-group">
              <div class="radio-option">
                <input type="radio" id="male" value="남성" v-model="formData.gender" required>
                <label for="male">남성</label>
              </div>
              <div class="radio-option">
                <input type="radio" id="female" value="여성" v-model="formData.gender" required>
                <label for="female">여성</label>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="phone">연락처 *</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="formData.phone" 
              placeholder="연락처를 입력하세요"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">이메일</label>
            <input 
              type="email" 
              id="email" 
              v-model="formData.email" 
              placeholder="이메일을 입력하세요"
            />
          </div>
          
          <div class="form-group">
            <label>관심사 (최대 3개 선택)</label>
            <div class="interests-grid">
              <div 
                v-for="interest in interests" 
                :key="interest"
                class="interest-checkbox"
              >
                <input 
                  type="checkbox" 
                  :id="interest" 
                  :value="interest" 
                  v-model="formData.interests"
                  :disabled="formData.interests.length >= 3 && !formData.interests.includes(interest)"
                >
                <label :for="interest">{{ interest }}</label>
              </div>
            </div>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="submit-button">신청하기</button>
        </form>
      </div>
      
      <div v-else class="success-message">
        <div class="success-icon">✓</div>
        <h3>신청이 완료되었습니다!</h3>
        <p>등록하신 연락처로 추가 정보를 보내드리겠습니다.</p>
        <p class="payment-info">입금 정보: 카카오뱅크 1234-56-7890123 (홍길동)</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
:root {
  --cream: #f5f5f5;
  --dark-brown: #754975;
  --primary-brown: #964B00;
  --secondary-brown: #786C3B;
  --text-color: #333;
  --text-light: #666;
}

.registration {
  padding: 5rem 2rem;
  background-color: var(--cream);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--dark-brown);
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
  background: linear-gradient(to right, var(--secondary-brown), var(--primary-brown));
  border-radius: 2px;
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.form-box {
  background-color: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
}

.form-box h3 {
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  color: var(--dark-brown);
}

.price-highlight {
  color: var(--primary-brown);
  font-weight: 700;
  font-size: 1.8rem;
}

.form-subtitle {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 2rem;
  text-decoration: line-through;
}

.registration-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

input[type="text"],
input[type="number"],
input[type="tel"],
input[type="email"] {
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  -webkit-appearance: none; /* Prevents iOS styling */
}

input:focus {
  border-color: var(--primary-brown);
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.2);
}

.radio-group {
  display: flex;
  gap: 2rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.8rem;
}

.interest-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message {
  color: #ff3366;
  font-size: 0.9rem;
  margin-top: -0.5rem;
}

.submit-button {
  background: linear-gradient(135deg, var(--secondary-brown), var(--primary-brown));
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
}

.success-message {
  background-color: white;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background-color: var(--primary-brown);
  color: white;
  font-size: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin: 0 auto 2rem;
}

.success-message h3 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--dark-brown);
}

.success-message p {
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.payment-info {
  margin-top: 1.5rem;
  font-weight: 500;
  color: var(--text-color);
  background-color: var(--cream);
  padding: 1rem;
  border-radius: 8px;
  display: inline-block;
}

@media (max-width: 768px) {
  .registration {
    padding: 3rem 1rem;
  }
  
  .section-title {
    font-size: 2rem;
    margin-bottom: 2.5rem;
  }
  
  .form-box {
    padding: 1.5rem;
  }
  
  .interests-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .radio-group {
    gap: 1rem;
  }
  
  input[type="text"],
  input[type="number"],
  input[type="tel"],
  input[type="email"] {
    padding: 0.75rem;
    font-size: 16px; /* Ensure no zooming on focus in mobile */
  }
}

@media (max-width: 480px) {
  .form-box h3 {
    font-size: 1.3rem;
  }
  
  .price-highlight {
    font-size: 1.5rem;
  }
  
  .interests-grid {
    grid-template-columns: repeat(1, 1fr);
  }
  
  .submit-button {
    font-size: 1.1rem;
    padding: 0.9rem;
  }
  
  .success-message {
    padding: 2rem 1rem;
  }
  
  .success-icon {
    width: 70px;
    height: 70px;
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
}
</style>
