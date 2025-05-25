<script setup>
import { ref, reactive, onMounted } from 'vue';
import supabase from '../supabase';

// 화면 상태 관리
const viewState = ref('auth'); // 'auth', 'profile', 'edit'
const loading = ref(false);
const error = ref(null);
const message = ref('');

// 인증 관련 상태
const phone = ref('');
const verificationCode = ref('');
const verificationId = ref(null);

// 사용자 프로필 데이터
const userProfile = ref(null);

// 수정용 프로필 데이터
const editProfile = reactive({
  name: '',
  birthYear: '',
  gender: '',
  church_name: '',
  location: '',
  height: '',
  field: '',
  mbti: '',
  hobby: ''
});

// 휴대폰 번호로 인증 코드 요청
async function requestVerificationCode() {
  if (!phone.value || phone.value.length < 10) {
    error.value = '올바른 휴대폰 번호를 입력해주세요';
    return;
  }
  
  try {
    loading.value = true;
    error.value = null;
    message.value = '';
    
    // Supabase 전화번호 인증 시작
    const { data, error: authError } = await supabase.auth.signInWithOtp({
      phone: formatPhoneNumber(phone.value)
    });
    
    if (authError) throw authError;
    
    message.value = '인증번호가 발송되었습니다. 문자를 확인해주세요.';
    verificationId.value = data?.verificationId || 'pending';
  } catch (err) {
    console.error('인증 코드 요청 오류:', err);
    error.value = '인증 코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.';
  } finally {
    loading.value = false;
  }
}

// 전화번호 포맷팅 (Supabase 요구사항에 맞게)
function formatPhoneNumber(phoneNumber) {
  // 한국 번호 형식 (+82)
  if (!phoneNumber.startsWith('+')) {
    // 첫 번째 0 제거하고 +82 추가
    if (phoneNumber.startsWith('0')) {
      return '+82' + phoneNumber.substring(1);
    }
    return '+82' + phoneNumber;
  }
  return phoneNumber;
}

// 인증 코드 확인
async function verifyCode() {
  if (!verificationCode.value || verificationCode.value.length < 6) {
    error.value = '올바른 인증번호를 입력해주세요';
    return;
  }
  
  try {
    loading.value = true;
    error.value = null;
    
    // Supabase 인증 코드 확인
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: formatPhoneNumber(phone.value),
      token: verificationCode.value,
      type: 'sms'
    });
    
    if (verifyError) throw verifyError;
    
    // 인증 성공 후 사용자 정보 조회
    await fetchUserProfile();
    
  } catch (err) {
    console.error('인증 코드 확인 오류:', err);
    error.value = '인증에 실패했습니다. 올바른 코드를 입력했는지 확인해주세요.';
  } finally {
    loading.value = false;
  }
}

// 사용자 프로필 조회
async function fetchUserProfile() {
  try {
    loading.value = true;
    error.value = null;
    
    const { data, error: fetchError } = await supabase
      .from('dating')
      .select('*')
      .eq('phone', phone.value)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        error.value = '등록된 정보가 없습니다.';
        return;
      }
      throw fetchError;
    }
    
    userProfile.value = data;
    
    // 수정 폼에 현재 데이터 채우기
    Object.keys(editProfile).forEach(key => {
      if (data[key]) editProfile[key] = data[key];
    });
    
    viewState.value = 'profile';
  } catch (err) {
    console.error('프로필 조회 오류:', err);
    error.value = '정보를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
}

// 수정 모드 시작
function startEdit() {
  viewState.value = 'edit';
}

// 수정 취소
function cancelEdit() {
  // 기존 데이터로 복원
  Object.keys(editProfile).forEach(key => {
    if (userProfile.value[key]) editProfile[key] = userProfile.value[key];
  });
  
  viewState.value = 'profile';
}

// 수정 사항 저장
async function saveProfile() {
  try {
    loading.value = true;
    error.value = null;
    
    const { error: updateError } = await supabase
      .from('dating')
      .update(editProfile)
      .eq('phone', phone.value);
    
    if (updateError) throw updateError;
    
    // 업데이트 후 최신 데이터 다시 불러오기
    await fetchUserProfile();
    message.value = '정보가 성공적으로 업데이트되었습니다.';
  } catch (err) {
    console.error('프로필 업데이트 오류:', err);
    error.value = '정보 업데이트에 실패했습니다.';
  } finally {
    loading.value = false;
  }
}

// 다시 인증 화면으로
function backToAuth() {
  viewState.value = 'auth';
  phone.value = '';
  verificationCode.value = '';
  verificationId.value = null;
  userProfile.value = null;
  error.value = null;
  message.value = '';
}

// 출생 연도 선택 옵션
const yearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 18; year >= 1950; year--) {
    years.push(year);
  }
  return years;
};

// MBTI 옵션
const mbtiOptions = [
  { value: '다윗', label: '다윗 - 열정적이고 자신감 있는 리더' },
  { value: '모세', label: '모세 - 책임감 있고 충성스러운 지도자' },
  { value: '에스더', label: '에스더 - 지혜롭고 용기 있는 중재자' },
  { value: '룻', label: '룻 - 충실하고 헌신적인 동행자' },
  { value: '요셉', label: '요셉 - 성실하고 꿈이 많은 계획가' },
  { value: '베드로', label: '베드로 - 열정적이고 솔직한 추진자' },
  { value: '드보라', label: '드보라 - 용감하고 통찰력 있는 선지자' },
  { value: '솔로몬', label: '솔로몬 - 지혜롭고 분석적인 사고자' },
  { value: '마리아', label: '마리아 - 섬세하고 깊은 사색가' },
  { value: '요한', label: '요한 - 사랑이 많고 평화를 추구하는 중재자' },
  { value: '아브라함', label: '아브라함 - 믿음이 강하고 새로운 길을 개척하는 모험가' },
  { value: '사라', label: '사라 - 인내심 있고 신실한 보호자' },
  { value: '제공하지않음', label: '제공하지 않음' }
];
</script>

<template>
  <section class="user-profile-section">
    <div class="container">
      <h1 class="section-title">내 정보 관리</h1>
      
      <!-- 로딩 표시 -->
      <div v-if="loading" class="loading-container">
        <div class="loader"></div>
        <p>처리 중입니다...</p>
      </div>
      
      <!-- 에러 메시지 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <!-- 성공 메시지 -->
      <div v-if="message" class="success-message">
        {{ message }}
      </div>
      
      <!-- 인증 화면 -->
      <div v-if="viewState === 'auth'" class="auth-container">
        <div class="form-section">
          <h2>내 정보 조회</h2>
          <p class="section-description">등록하신 휴대폰 번호로 인증 후 정보를 확인하실 수 있습니다.</p>
          
          <div class="form-group">
            <label for="phone">휴대폰 번호</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="phone" 
              placeholder="01012345678" 
              :disabled="loading || verificationId" 
              class="form-input"
            >
          </div>
          
          <button 
            @click="requestVerificationCode" 
            :disabled="loading || verificationId || !phone" 
            class="action-button"
          >
            인증번호 요청
          </button>
          
          <div v-if="verificationId" class="verification-section">
            <div class="form-group">
              <label for="verificationCode">인증번호</label>
              <input 
                type="text" 
                id="verificationCode" 
                v-model="verificationCode" 
                placeholder="인증번호 6자리" 
                :disabled="loading" 
                class="form-input"
              >
            </div>
            
            <button 
              @click="verifyCode" 
              :disabled="loading || !verificationCode" 
              class="action-button"
            >
              확인
            </button>
          </div>
        </div>
      </div>
      
      <!-- 프로필 조회 화면 -->
      <div v-else-if="viewState === 'profile'" class="profile-container">
        <div class="profile-header">
          <h2>내 정보</h2>
          <div class="profile-actions">
            <button @click="startEdit" class="edit-button">수정하기</button>
            <button @click="backToAuth" class="back-button">다른 번호로 조회</button>
          </div>
        </div>
        
        <div class="profile-data">
          <div class="profile-row">
            <div class="profile-label">이름</div>
            <div class="profile-value">{{ userProfile.name }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">휴대폰 번호</div>
            <div class="profile-value">{{ userProfile.phone }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">출생연도</div>
            <div class="profile-value">{{ userProfile.birthYear }}년</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">성별</div>
            <div class="profile-value">{{ userProfile.gender }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">교회</div>
            <div class="profile-value">{{ userProfile.church_name }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">지역</div>
            <div class="profile-value">{{ userProfile.location }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">키</div>
            <div class="profile-value">{{ userProfile.height }}cm</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">직업</div>
            <div class="profile-value">{{ userProfile.field }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">성격 유형</div>
            <div class="profile-value">{{ userProfile.mbti }}</div>
          </div>
          
          <div class="profile-row">
            <div class="profile-label">취미</div>
            <div class="profile-value">{{ userProfile.hobby || '정보 없음' }}</div>
          </div>
        </div>
      </div>
      
      <!-- 프로필 수정 화면 -->
      <div v-else-if="viewState === 'edit'" class="edit-container">
        <div class="edit-header">
          <h2>내 정보 수정</h2>
          <div class="edit-actions">
            <button @click="cancelEdit" class="cancel-button">취소</button>
          </div>
        </div>
        
        <div class="edit-form">
          <div class="form-group">
            <label for="edit-name">이름</label>
            <input type="text" id="edit-name" v-model="editProfile.name" class="form-input">
          </div>
          
          <div class="form-group">
            <label>휴대폰 번호</label>
            <div class="disabled-field">{{ phone }} (변경불가)</div>
          </div>
          
          <div class="form-group">
            <label for="edit-birthYear">출생연도</label>
            <select id="edit-birthYear" v-model="editProfile.birthYear" class="form-select">
              <option v-for="year in yearOptions()" :key="year" :value="year">{{ year }}년</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>성별</label>
            <div class="disabled-field">{{ userProfile.gender }} (변경불가)</div>
          </div>
          
          <div class="form-group">
            <label for="edit-church">교회</label>
            <input type="text" id="edit-church" v-model="editProfile.church_name" class="form-input">
          </div>
          
          <div class="form-group">
            <label for="edit-location">지역</label>
            <input type="text" id="edit-location" v-model="editProfile.location" class="form-input">
          </div>
          
          <div class="form-group">
            <label for="edit-height">키 (cm)</label>
            <input type="number" id="edit-height" v-model="editProfile.height" class="form-input">
          </div>
          
          <div class="form-group">
            <label for="edit-field">직업</label>
            <input type="text" id="edit-field" v-model="editProfile.field" class="form-input">
          </div>
          
          <div class="form-group">
            <label for="edit-mbti">성격 유형</label>
            <select id="edit-mbti" v-model="editProfile.mbti" class="form-select">
              <option v-for="option in mbtiOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-hobby">취미</label>
            <input type="text" id="edit-hobby" v-model="editProfile.hobby" class="form-input">
          </div>
          
          <button @click="saveProfile" :disabled="loading" class="save-button">
            저장하기
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.user-profile-section {
  padding: 3rem 1rem;
  background-color: var(--cream);
  min-height: 100vh;
}

.section-title {
  font-size: 2.5rem;
  color: var(--dark-brown);
  text-align: center;
  margin-bottom: 2rem;
}

.section-description {
  text-align: center;
  color: var(--text-light);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loader {
  border: 5px solid #f3f3f3;
  border-radius: 50%;
  border-top: 5px solid var(--primary-brown);
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.auth-container,
.profile-container,
.edit-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
  overflow: hidden;
}

.form-section {
  padding: 2rem;
}

.form-section h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--dark-brown);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(200, 162, 124, 0.2);
  outline: none;
}

.form-select {
  display: block;
  width: 100%;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
  background-color: #ffffff;
  background-clip: padding-box;
  border: 1px solid #ddd;
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

.action-button,
.edit-button,
.back-button,
.cancel-button,
.save-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  width: 100%;
}

.action-button {
  background-color: var(--primary-brown);
  color: white;
  margin-top: 1rem;
}

.verification-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.profile-header,
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #eee;
  background-color: var(--cream);
}

.profile-header h2,
.edit-header h2 {
  margin: 0;
  color: var(--dark-brown);
}

.profile-actions,
.edit-actions {
  display: flex;
  gap: 1rem;
}

.edit-button,
.save-button {
  background-color: var(--primary-brown);
  color: white;
}

.back-button,
.cancel-button {
  background-color: #e0e0e0;
  color: var(--text-color);
}

.profile-data {
  padding: 2rem;
}

.profile-row {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 0.8rem;
}

.profile-label {
  flex: 0 0 120px;
  font-weight: 600;
  color: var(--text-light);
}

.profile-value {
  flex: 1;
  color: var(--text-color);
}

.edit-form {
  padding: 2rem;
}

.disabled-field {
  padding: 0.8rem 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: var(--text-light);
}

.save-button {
  margin-top: 2rem;
}

.action-button:hover,
.edit-button:hover,
.save-button:hover {
  background-color: var(--secondary-brown);
  transform: translateY(-2px);
}

.back-button:hover,
.cancel-button:hover {
  background-color: #d1d1d1;
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .profile-row {
    flex-direction: column;
  }
  
  .profile-label {
    margin-bottom: 0.5rem;
  }
  
  .profile-header,
  .edit-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .profile-actions,
  .edit-actions {
    width: 100%;
  }
  
  .profile-actions button,
  .edit-actions button {
    flex: 1;
  }
}
</style>
