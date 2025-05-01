<script setup>
import { ref, onMounted, computed } from 'vue';
import supabase from '../supabase';

const profiles = ref([]);
const loading = ref(true);
const error = ref(null);
const showApplicationForm = ref(false);
const scrollContainer = ref(null);

// Form step tracking
const currentStep = ref(1);
const totalSteps = 3;

// Form data
const formData = ref({
  name: '',
  birthYear: '',
  gender: '',
  phone: '',
  church_name: '',
  location: '',
  height: '',
  field: '',
  company_name: '',
  mbti: '제공하지않음',
  hobby: ''
});

const formErrors = ref({});

const maleRemaining = computed(() => {
  if (loading.value || error.value) return null;
  const maleCount = profiles.value.filter(profile => profile.gender === '남자').length;
  console.log('남자 프로필 수:', maleCount, '남은 자리:', 50 - maleCount);
  return Math.max(0, 50 - maleCount);
});

const femaleRemaining = computed(() => {
  if (loading.value || error.value) return null;
  const femaleCount = profiles.value.filter(profile => profile.gender === '여자').length;
  console.log('여자 프로필 수:', femaleCount, '남은 자리:', 50 - femaleCount);
  return Math.max(0, 50 - femaleCount);
});

// Prepare display profiles - repeat the array if too few entries
const displayProfiles = computed(() => {
  if (profiles.value.length === 0) return [];
  // If we have fewer than 5 profiles, duplicate them to ensure smooth scrolling
  if (profiles.value.length < 5) {
    let result = [...profiles.value];
    while (result.length < 10) {
      result = result.concat([...profiles.value]);
    }
    return result;
  }
  return profiles.value;
});

async function fetchProfiles() {
  try {
    loading.value = true;
    const { data, error: err } = await supabase
      .from('dating')
      .select('gender, height, field')
      .order('created_at', { ascending: false });
    
    if (err) throw err;
    
    profiles.value = data;
    console.log('로드된 프로필 데이터:', data);
    console.log('성별 분포:', data.reduce((acc, profile) => {
      acc[profile.gender] = (acc[profile.gender] || 0) + 1;
      return acc;
    }, {}));
    loading.value = false;
  } catch (err) {
    console.error('Error fetching profiles:', err);
    error.value = 'Failed to load profiles data';
    loading.value = false;
  }
}

async function submitApplication() {
  // Reset errors
  formErrors.value = {};
  console.log('Form submission started');
  console.log('Form data:', formData.value);
  
  // Simple validation for all required fields
  if (!formData.value.name) formErrors.value.name = '이름을 입력해주세요';
  if (!formData.value.birthYear) formErrors.value.birthYear = '태어난 연도를 입력해주세요';
  if (!formData.value.gender) formErrors.value.gender = '성별을 선택해주세요';
  if (!formData.value.phone) formErrors.value.phone = '연락처를 입력해주세요';
  if (!formData.value.church_name) formErrors.value.church_name = '섬기는 교회 이름을 입력해주세요';
  if (!formData.value.location) formErrors.value.location = '거주 지역을 입력해주세요';
  if (!formData.value.height) formErrors.value.height = '키를 입력해주세요';
  if (!formData.value.field) formErrors.value.field = '직업을 입력해주세요';
  
  // Additional validation for phone number format
  if (formData.value.phone && !/^\d{10,11}$/.test(formData.value.phone)) {
    formErrors.value.phone = '유효한 전화번호를 입력해주세요 (10-11자리 숫자)';
  }
  
  // Birth year validation (reasonable range)
  if (formData.value.birthYear) {
    const year = parseInt(formData.value.birthYear);
    const currentYear = new Date().getFullYear();
    if (year < 1950 || year > currentYear - 18) {
      formErrors.value.birthYear = '유효한 출생연도를 입력해주세요 (1950~' + (currentYear - 18) + ')';
    }
  }
  
  // Height validation (reasonable range)
  if (formData.value.height) {
    const height = parseInt(formData.value.height);
    if (height < 140 || height > 210) {
      formErrors.value.height = '유효한 키를 입력해주세요 (140~210cm)';
    }
  }
  
  // Log validation errors if any
  if (Object.keys(formErrors.value).length > 0) {
    console.log('Validation errors:', formErrors.value);
    return;
  }
  
  console.log('Validation passed, preparing to submit');
  
  try {
    console.log('Submitting to Supabase table "dating"');
    // First, save to Supabase
    const submissionData = {
      // Generate a numeric ID for int8 field type (using timestamp to ensure uniqueness)
      id: Date.now(),
      name: formData.value.name,
      birth_year: formData.value.birthYear,
      gender: formData.value.gender,
      phone: formData.value.phone,
      church_name: formData.value.church_name,
      location: formData.value.location,
      height: formData.value.height,
      field: formData.value.field,
      company_name: formData.value.company_name || null,
      mbti: formData.value.mbti,
      hobby: formData.value.hobby,
      created_at: new Date().toISOString()
    };
    
    console.log('Data being submitted to Supabase:', submissionData);
    
    const { data, error: err } = await supabase
      .from('dating')
      .insert([submissionData]);
    
    console.log('Supabase response - data:', data);
    console.log('Supabase response - error:', err);
    
    if (err) {
      console.error('Supabase insert error:', err);
      throw err;
    }
    
    console.log('Supabase submission successful');
    
    // Send SMS confirmation to the user
    try {
      console.log('Sending SMS confirmation...');
      const smsMessage = `${formData.value.name} 님 참가신청해주셔서 감사합니다! 아래 네이버 구매링크로 구매하시면 휴대폰번호가 매칭되어서 자동으로 리스트에 올라갑니다. 저희가 5월 중에 매칭결과가 나오면 다시 알려드릴께요!`;
      
      const smsResponse = await fetch('http://api.tangibly.link/sendsms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.value.phone,
          message: smsMessage
        })
      });
      
      if (!smsResponse.ok) {
        console.error('SMS sending failed:', await smsResponse.text());
        // Don't throw error here, so form submission still succeeds even if SMS fails
      } else {
        console.log('SMS sent successfully');
      }
    } catch (smsErr) {
      console.error('Error sending SMS:', smsErr);
      // Don't throw error here, so form submission still succeeds even if SMS fails
    }
    
    // Reset form and close modal on success
    resetForm();
    showApplicationForm.value = false;
    console.log('Form reset and modal closed');
    alert('신청이 완료되었습니다!');
  } catch (err) {
    console.error('Application submission error details:', err);
    console.error('Error type:', typeof err);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

function resetForm() {
  // Reset all form fields
  formData.value = {
    name: '',
    birthYear: '',
    gender: '',
    phone: '',
    church_name: '',
    location: '',
    height: '',
    field: '',
    company_name: '',
    mbti: '제공하지않음',
    hobby: ''
  };
  formErrors.value = {};
  currentStep.value = 1;
}

// Navigation functions for multi-step form
function nextStep() {
  // Validate current step before proceeding
  if (currentStep.value === 1) {
    // Validate step 1 fields
    formErrors.value = {};
    if (!formData.value.name) formErrors.value.name = '이름을 입력해주세요';
    if (!formData.value.birthYear) formErrors.value.birthYear = '태어난 연도를 입력해주세요';
    if (!formData.value.gender) formErrors.value.gender = '성별을 선택해주세요';
    if (!formData.value.phone) formErrors.value.phone = '연락처를 입력해주세요';
    
    // Additional validation for phone number format
    if (formData.value.phone && !/^\d{10,11}$/.test(formData.value.phone)) {
      formErrors.value.phone = '유효한 전화번호를 입력해주세요 (10-11자리 숫자)';
    }
    
    // Birth year validation (reasonable range)
    if (formData.value.birthYear) {
      const year = parseInt(formData.value.birthYear);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear - 18) {
        formErrors.value.birthYear = '유효한 출생연도를 입력해주세요 (1950~' + (currentYear - 18) + ')';
      }
    }
    
    if (Object.keys(formErrors.value).length > 0) {
      return; // Don't proceed if validation fails
    }
  } else if (currentStep.value === 2) {
    // Validate step 2 fields
    formErrors.value = {};
    if (!formData.value.church_name) formErrors.value.church_name = '섬기는 교회 이름을 입력해주세요';
    if (!formData.value.location) formErrors.value.location = '거주 지역을 입력해주세요';
    if (!formData.value.height) formErrors.value.height = '키를 입력해주세요';
    if (!formData.value.field) formErrors.value.field = '직업을 입력해주세요';
    
    // Height validation (reasonable range)
    if (formData.value.height) {
      const height = parseInt(formData.value.height);
      if (height < 140 || height > 210) {
        formErrors.value.height = '유효한 키를 입력해주세요 (140~210cm)';
      }
    }
    
    if (Object.keys(formErrors.value).length > 0) {
      return; // Don't proceed if validation fails
    }
  }
  
  // If validation passes, move to next step
  if (currentStep.value < totalSteps) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

onMounted(() => {
  fetchProfiles();
  
  // Add pause animation on hover
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('mouseenter', () => {
      document.querySelector('.profile-entries').style.animationPlayState = 'paused';
    });
    
    scrollContainer.value.addEventListener('mouseleave', () => {
      document.querySelector('.profile-entries').style.animationPlayState = 'running';
    });
  }
});
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <div class="english-title">Tangible Christian Dating</div>
      <h1>특별한 만남의 시작</h1>
      <h2>교회 청년들 모두 다 짝 찾아주자 이벤트</h2>
      
      <div class="intro-text">
        <p>- 저는 대형교회 다니는 평범한 30대 개발자입니다. 주변에 소개시켜달라는 형제,자매분들 많은데 같은 교회에서는 서로 눈치보면서 못만나고, 소개팅은 부담스럽고, 나의 준비하신 인연 어디있는지 모르겠고..</p>
        <p>- 시험공부도/취업준비도 기도만 열심히하고 현실적으로 준비 안하면 결과가 나오는게 아니듯이, 배우자기도도 기도만하고 만날 노력을 하지않으면 기도 응답을 받기 어렵다고 생각합니다.</p>
        <p>- 이런 친구들이 주변에 많아서 한번 만들어봤습니다. 문뜨 이런 교회 친구들을 전부 모아서 연결해주면 어떨까 생각해봤습니다.</p>
      </div>
      
      <div class="promotion">
        <div class="title-wrapper">
          <h3 class="section-title">현재 신청목록</h3>
          <span class="realtime-label">실시간</span>
        </div>
        <div class="remaining-slots" v-if="!loading && !error">
          <div class="slot-item">
            <span class="slot-emoji">👨</span>
            <span class="slot-text">남성 <strong>{{ maleRemaining }}</strong>자리 남음</span>
          </div>
          <div class="slot-item">
            <span class="slot-emoji">👩</span>
            <span class="slot-text">여성 <strong>{{ femaleRemaining }}</strong>자리 남음</span>
          </div>
        </div>
        <div class="participants-list">
          <div v-if="loading" class="loading">데이터를 불러오는 중...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else-if="profiles.length === 0" class="no-participants">아직 등록된 참가자가 없습니다.</div>
          <div v-else ref="scrollContainer" class="profile-entries-container">
            <div class="profile-entries">
              <div v-for="(profile, index) in displayProfiles" :key="'original-'+index" class="profile-entry">
                <span class="profile-name">
                  {{ profile.gender }}
                  <span class="gender-emoji">{{ profile.gender === '남자' ? '👨' : profile.gender === '여자' ? '👩' : '' }}</span>
                </span>
                <span class="profile-details">{{ profile.height }}cm, {{ profile.field }}</span>
              </div>
              <div v-for="(profile, index) in displayProfiles" :key="'duplicate-'+index" class="profile-entry">
                <span class="profile-name">
                  {{ profile.gender }}
                  <span class="gender-emoji">{{ profile.gender === '남자' ? '👨' : profile.gender === '여자' ? '👩' : '' }}</span>
                </span>
                <span class="profile-details">{{ profile.height }}cm, {{ profile.field }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 네이버 스마트 스토어로 연결 -->
      <a href="https://smartstore.naver.com/tangible/products/11422139807" target="_blank" class="cta-button naver-button">
        <svg class="naver-icon" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H10.2V12H11V4Z" fill="currentColor"/>
          <path d="M5 4H4V12H5L9 7V12H10V4H9L5 9V4Z" fill="currentColor"/>
        </svg>
        네이버에서 구매하기
      </a>
      
      <!-- 참가신청 폼 버튼 -->
      <button @click="showApplicationForm = true" class="cta-button application-button">
        참가신청 폼 입력하기
      </button>
    </div>
  </section>
  
  <!-- 참가신청 폼 모달 -->
  <div v-if="showApplicationForm" class="modal-overlay" @click.self="showApplicationForm = false">
    <div class="modal-content">
      <div class="modal-header">
        <h2>참가 신청</h2>
        <button @click="showApplicationForm = false" class="close-button" aria-label="Close modal">
          <span>&times;</span>
        </button>
      </div>
      <form @submit.prevent="submitApplication" class="application-form">
        <!-- Progress indicators -->
        <div class="step-indicators">
          <div v-for="step in totalSteps" :key="step" class="step-indicator" :class="{ 'active': currentStep === step, 'completed': currentStep > step }">
            <div class="step-number">{{ step }}</div>
            <div class="step-label">
              {{ step === 1 ? '기본 정보' : step === 2 ? '교회/직업 정보' : 'MBTI' }}
            </div>
          </div>
        </div>
    

        <div v-if="currentStep === 1" class="step-1">
          <div class="form-group">
            <label for="name">이름 <span class="required">*</span></label>
            <input 
              type="text" 
              placeholder="김땡땡"
              id="name" 
              v-model="formData.name" 
              :class="{ 'error-input': formErrors.name }"
            >
            <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
          </div>
          
          <div class="form-group">
            <label for="birthYear">태어난 연도 <span class="required">*</span></label>
            <input 
              type="number" 
              id="birthYear" 
              v-model="formData.birthYear" 
              placeholder="1990, 2005"
              :class="{ 'error-input': formErrors.birthYear }"
            >
            <div v-if="formErrors.birthYear" class="error-message">{{ formErrors.birthYear }}</div>
          </div>
          
          <div class="form-group">
            <label for="gender">성별 <span class="required">*</span></label>
            <select 
              id="gender" 
              v-model="formData.gender"
              :class="{ 'error-input': formErrors.gender }"
            >
              <option value="" disabled selected>선택해주세요</option>
              <option value="남자">남자</option>
              <option value="여자">여자</option>
            </select>
            <div v-if="formErrors.gender" class="error-message">{{ formErrors.gender }}</div>
          </div>
          
          <div class="form-group">
            <label for="phone">연락처 (- 없이 숫자만 입력) <span class="required">*</span></label>
            <input 
              type="tel" 
              id="phone" 
              v-model="formData.phone" 
              placeholder="01012345678"
              :class="{ 'error-input': formErrors.phone }"
            >
            <div v-if="formErrors.phone" class="error-message">{{ formErrors.phone }}</div>
          </div>
        </div>
        
        <div v-if="currentStep === 2" class="step-2">
          <div class="form-group">
            <label for="church_name">섬기는 교회 이름 <span class="required">*</span></label>
            <input 
              type="text" 
              id="church_name" 
              v-model="formData.church_name"
              :class="{ 'error-input': formErrors.church_name }"
            >
            <div v-if="formErrors.church_name" class="error-message">{{ formErrors.church_name }}</div>
          </div>
          
          <div class="form-group">
            <label for="location">현재 거주 지역 (시+구), 매칭시 활용 <span class="required">*</span></label>
            <input 
              type="text" 
              id="location" 
              v-model="formData.location" 
              placeholder="서울시 강남구, 성남시 분당구"
              :class="{ 'error-input': formErrors.location }"
            >
            <div v-if="formErrors.location" class="error-message">{{ formErrors.location }}</div>
          </div>
          
          <div class="form-group">
            <label for="height">본인 키 <span class="required">*</span></label>
            <input 
              type="number" 
              id="height" 
              v-model="formData.height" 
              placeholder="170, 183"
              :class="{ 'error-input': formErrors.height }"
            >
            <div v-if="formErrors.height" class="error-message">{{ formErrors.height }}</div>
          </div>
          
          <div class="form-group">
            <label for="field">직업 또는 일하는 직군/업계 <span class="required">*</span></label>
            <input 
              type="text" 
              id="field" 
              placeholder="예: IT, 공무원, 간호사"
              v-model="formData.field"
              :class="{ 'error-input': formErrors.field }"
            >
            <div v-if="formErrors.field" class="error-message">{{ formErrors.field }}</div>
          </div>
          <div class="verification-notice">
            교회인증(교회주보로 인증), 회사인증(사원증 or 명함) 으로 인증하는 절차가 나중에 진행됩니다.
          </div>
        </div>

        <div v-if="currentStep === 3" class="step-3">
          <div class="form-group">
            <label for="mbti">MBTI (선택입력)</label>
            <select 
              id="mbti"
              v-model="formData.mbti"
              class="form-select"
            >
              <option value="제공하지않음">제공하지 않음</option>
              <option value="INTJ">INTJ</option>
              <option value="INTP">INTP</option>
              <option value="ENTJ">ENTJ</option>
              <option value="ENTP">ENTP</option>
              <option value="INFJ">INFJ</option>
              <option value="INFP">INFP</option>
              <option value="ENFJ">ENFJ</option>
              <option value="ENFP">ENFP</option>
              <option value="ISTJ">ISTJ</option>
              <option value="ISFJ">ISFJ</option>
              <option value="ESTJ">ESTJ</option>
              <option value="ESFJ">ESFJ</option>
              <option value="ISTP">ISTP</option>
              <option value="ISFP">ISFP</option>
              <option value="ESTP">ESTP</option>
              <option value="ESFP">ESFP</option>
              <option value="모릅니다">모릅니다</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="hobby">취미 (선택입력)</label>
            <input 
              type="text" 
              id="hobby" 
              v-model="formData.hobby"
              placeholder="예: 테니스, 클라이밍, 보드게임..."
            >
          </div>

          <div class="verification-notice">
           나중에 이상형 정보도 추가로 입력요청 드릴게요.
          </div>

        </div>
        
        <div class="form-actions">
          <div class="button-row">
            <div class="navigation-buttons">
              <button v-if="currentStep > 1" type="button" @click="prevStep" class="prev-button">이전</button>
              <button v-if="currentStep < totalSteps" type="button" @click="nextStep" class="next-button">다음</button>
              <button v-if="currentStep === totalSteps" type="submit" class="submit-button">신청하기</button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
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

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--cream);
}

.realtime-label {
  font-size: 1rem;
  color: var(--accent);
  background-color: var(--dark-brown);
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
}

.participants-list {
  text-align: left;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 160px;
  overflow: hidden;
  position: relative;
}

.participants-list::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30px;
  background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(105, 80, 61, 0.5));
  pointer-events: none;
}

.profile-entries-container {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.profile-entries {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: scroll-up 15s linear infinite;
}

@keyframes scroll-up {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.profile-entry {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 25px; /* Ensure consistent height */
}

.profile-name {
  font-weight: 600;
  color: var(--cream);
  display: flex;
  align-items: center;
  gap: 5px;
}

.gender-emoji {
  font-size: 1.2rem;
}

.profile-details {
  font-size: 0.9rem;
  opacity: 0.8;
}

.loading, .error, .no-participants {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: var(--cream);
  opacity: 0.8;
}

.remaining-slots {
  display: flex;
  justify-content: space-around;
  padding: 0.8rem;
  margin-bottom: 1rem;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: var(--cream);
}

.slot-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.slot-emoji {
  font-size: 1.3rem;
}

.slot-text {
  font-size: 0.95rem;
}

.slot-text strong {
  font-size: 1.2rem;
  color: var(--light-brown);
}

.cta-button {
  background-color: #19ce60;
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
  width: 100%;
  max-width: 350px;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
  background-color: #00b843;
}

.naver-button {
  background-color: #19ce60;
  margin-bottom: 1rem;
}

.application-button {
  background-color: #5a3a1a;
}

.application-button:hover {
  background-color: #7a5a3a;
}

.naver-icon {
  margin-right: 14px;
  font-size: 1.3em;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
  backdrop-filter: blur(3px);
}

.modal-content {
  background-color: #ffffff;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  color: #333333;
  opacity: 1;
  border: 1px solid #ddd;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  color: #666;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #333;
}

.modal-content h2 {
  color: #5a3a1a;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
}

.application-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.step-indicators::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-indicator.active .step-number {
  background-color: #19ce60;
  color: white;
}

.step-indicator.completed .step-number {
  background-color: #00b843;
  color: white;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #666;
  text-align: center;
}

.step-indicator.active .step-label {
  color: #333;
  font-weight: 600;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: #ffffff;
  margin-bottom: 1.2rem;
}

.form-group label {
  font-weight: 600;
  font-size: 1rem;
  color: #333333;
}

.form-group input,
.form-group select {
  padding: 0.8rem;
  border: 1px solid #cccccc;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #333333;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--accent);
  outline: none;
  box-shadow: 0 0 0 2px rgba(25, 206, 96, 0.2);
}

.error-input {
  border-color: #e74c3c !important;
  background-color: #fff6f6 !important;
}

.error-message {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.2rem;
  font-weight: 600;
}

.verification-notice {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
  border-left: 4px solid #19ce60;
}

.prev-button,
.next-button,
.submit-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  height: 40px;
  box-sizing: border-box;
  flex: 0 0 auto;
}

.prev-button {
  background-color: #e0e0e0;
  color: #333;
}

.next-button,
.submit-button {
  background-color: #19ce60;
  color: white;
}

.prev-button:hover {
  background-color: #d1d1d1;
}

.next-button:hover,
.submit-button:hover {
  background-color: #00b843;
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.button-row {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
  flex: 1;
  justify-content: flex-end;
}

.prev-button,
.next-button,
.submit-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  height: 40px;
  box-sizing: border-box;
  flex: 0 0 auto;
}

.prev-button {
  background-color: #e0e0e0;
  color: #333;
}

.next-button,
.submit-button {
  background-color: #19ce60;
  color: white;
}

.prev-button:hover {
  background-color: #d1d1d1;
}

.next-button:hover,
.submit-button:hover {
  background-color: #00b843;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .button-row {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }
  
  .navigation-buttons {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-top: 0.75rem;
  }
  
  .prev-button,
  .next-button,
  .submit-button {
    flex: 1;
    min-width: 0;
    padding: 0.7rem 0.5rem;
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
    margin: 0.5rem auto;
  }
  
  .step-number {
    width: 28px;
    height: 28px;
    font-size: 0.9rem;
  }
  
  .step-label {
    font-size: 0.65rem;
  }
}

.required {
  color: #e74c3c;
  font-weight: 600;
  margin-left: 2px;
}

.form-select {
  display: block;
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #ffffff;
  background-clip: padding-box;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.15s ease-in-out;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

.form-select:focus {
  border-color: #19ce60;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(25, 206, 96, 0.25);
}
</style>
