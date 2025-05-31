<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import supabase from '../supabase';
import { trackPageView } from '../analytics';
// Import Font Awesome for icons
import '@fortawesome/fontawesome-free/css/all.css';

const route = useRoute();
const router = useRouter();
const profileId = route.params.id;
const profile = ref(null);
const loading = ref(true);
const error = ref(null);
const isEditing = ref(false);
const phoneVerification = ref('');
const isVerified = ref(false);
const editedProfile = ref({});
const visiblePhonePart = ref('');

// Fetch profile data from Supabase
async function fetchProfile() {
  try {
    loading.value = true;
    const { data, error: fetchError } = await supabase
      .from('dating')
      .select('*')
      .eq('id', profileId)
      .single();

    if (fetchError) throw fetchError;
    profile.value = data;
    editedProfile.value = { ...data };
    
    // Extract visible part of phone number (first 7 digits)
    if (data.phone && data.phone.length >= 7) {
      visiblePhonePart.value = data.phone.substring(0, 7);
    }
  } catch (err) {
    error.value = '프로필을 불러오는 중 오류가 발생했습니다.';
    console.error('Error fetching profile:', err);
  } finally {
    loading.value = false;
  }
}

// Verify phone number
function verifyPhone() {
  if (!phoneVerification.value) {
    error.value = '마지막 4자리를 입력해주세요.';
    return;
  }
  
  // Check if the last 4 digits match with the profile's phone
  if (profile.value && profile.value.phone) {
    const lastFourDigits = profile.value.phone.slice(-4);
    
    if (phoneVerification.value === lastFourDigits) {
      isVerified.value = true;
      error.value = null;
    } else {
      error.value = '전화번호 마지막 4자리가 일치하지 않습니다.';
    }
  } else {
    error.value = '전화번호 정보가 없습니다.';
  }
}

// Toggle edit mode
function toggleEdit() {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    editedProfile.value = { ...profile.value };
  }
}

// Save profile changes
async function saveProfile() {
  try {
    loading.value = true;
    console.log('Saving profile with ID:', profileId);
    console.log('Data to update:', editedProfile.value);
    
    // Create a clean update object (remove created_at and other fields that might cause issues)
    const updateData = { ...editedProfile.value };
    delete updateData.created_at; // Remove timestamp that might cause conflicts
    delete updateData.id; // Remove id as it's used in the query condition
    
    console.log('Cleaned update data:', updateData);
    
    const { data, error: updateError } = await supabase
      .from('dating')
      .update(updateData)
      .eq('id', profileId)
      .select();

    if (updateError) {
      console.error('Supabase update error details:', updateError);
      throw updateError;
    }
    
    console.log('Update successful, response:', data);
    
    // Update local profile data with edited data
    profile.value = { ...editedProfile.value };
    isEditing.value = false;
    error.value = null;
    alert('프로필이 성공적으로 저장되었습니다.');
  } catch (err) {
    error.value = '프로필 저장 중 오류가 발생했습니다.';
    console.error('Error updating profile:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProfile();
  trackPageView(`profile-${profileId}`);
});
</script>

<template>
  <div class="profile-page container">
    <h2 class="page-title">프로필 페이지</h2>
    
    <div v-if="loading" class="loading">
      <p>로딩 중...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="fetchProfile" class="btn">다시 시도</button>
    </div>
    
    <div v-else>
      <!-- Phone Verification Section -->
      <div v-if="!isVerified" class="verification-section">
        <!-- <h2>본인 확인</h2> -->
        <!-- <p>휴대폰 번호 입력</p> -->
        
        <div class="form-group phone-verification-section">
          <label for="phone">본인 확인을 위한 휴대폰 번호 확인</label>
          <p class="verification-instruction">등록된 휴대폰 번호의 마지막 <span class="highlight">4자리</span>를 입력해주세요</p>
          
          <div class="phone-verification-container">
            <div class="phone-display">
              <span class="visible-phone-part">{{ visiblePhonePart }}</span>
              <span class="phone-separator">-</span>
              <span class="hidden-part">****</span>
            </div>
            <div class="input-container">
              <input 
                type="text" 
                id="phone" 
                v-model="phoneVerification" 
                placeholder="0000"
                class="form-input last-four-digits"
                maxlength="4"
              />
              <div class="input-icon">
                <i class="fas fa-lock"></i>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="verifyPhone" class="btn primary-btn">확인</button>
      </div>
      
      <!-- Profile Display Section -->
      <div v-else class="profile-section">
        <div class="profile-header">
          <h2>{{ profile.name }}님의 프로필</h2>
          <button v-if="!isEditing" @click="toggleEdit" class="btn edit-btn">수정</button>
          <div v-else class="edit-actions">
            <button @click="saveProfile" class="btn save-btn">저장</button>
            <button @click="toggleEdit" class="btn cancel-btn">취소</button>
          </div>
        </div>
        
        <!-- View Mode -->
        <div v-if="!isEditing" class="profile-details">
          <div class="profile-row">
            <span class="label">이름:</span>
            <span class="value">{{ profile.name }}</span>
          </div>
          <div class="profile-row">
            <span class="label">성별:</span>
            <span class="value">{{ profile.gender }}</span>
          </div>
          <div class="profile-row">
            <span class="label">출생년도:</span>
            <span class="value">{{ profile.birth_year }}</span>
          </div>
          <div class="profile-row">
            <span class="label">키:</span>
            <span class="value">{{ profile.height }}cm</span>
          </div>
          <div class="profile-row">
            <span class="label">직업분야:</span>
            <span class="value">{{ profile.field }}</span>
          </div>
          <div class="profile-row">
            <span class="label">회사:</span>
            <span class="value">{{ profile.company_name }}</span>
          </div>
          <div class="profile-row">
            <span class="label">교회:</span>
            <span class="value">{{ profile.church_name }}</span>
          </div>
          <div class="profile-row">
            <span class="label">거주지:</span>
            <span class="value">{{ profile.location }}</span>
          </div>
          <div class="profile-row" v-if="profile.mbti">
            <span class="label">MBTI:</span>
            <span class="value">{{ profile.mbti }}</span>
          </div>
          <div class="profile-row" v-if="profile.hobby">
            <span class="label">취미:</span>
            <span class="value">{{ profile.hobby }}</span>
          </div>
          <div class="profile-row" v-if="profile.charm_points">
            <span class="label">매력 포인트:</span>
            <span class="value">{{ profile.charm_points }}</span>
          </div>
          <div class="profile-row" v-if="profile.ideal_type">
            <span class="label">이상형:</span>
            <span class="value">{{ profile.ideal_type }}</span>
          </div>
        </div>
        
        <!-- Edit Mode -->
        <div v-else class="profile-edit-form">
          <div class="form-group">
            <label for="edit-name">이름:</label>
            <input type="text" id="edit-name" v-model="editedProfile.name" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-gender">성별:</label>
            <select id="edit-gender" v-model="editedProfile.gender" class="form-input">
              <option value="남자">남자</option>
              <option value="여자">여자</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-birth-year">출생년도:</label>
            <input type="number" id="edit-birth-year" v-model="editedProfile.birth_year" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-height">키 (cm):</label>
            <input type="number" id="edit-height" v-model="editedProfile.height" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-field">직업분야:</label>
            <input type="text" id="edit-field" v-model="editedProfile.field" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-company">회사:</label>
            <input type="text" id="edit-company" v-model="editedProfile.company_name" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-church">교회:</label>
            <input type="text" id="edit-church" v-model="editedProfile.church_name" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-location">거주지:</label>
            <input type="text" id="edit-location" v-model="editedProfile.location" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-mbti">MBTI:</label>
            <input type="text" id="edit-mbti" v-model="editedProfile.mbti" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-hobby">취미:</label>
            <input type="text" id="edit-hobby" v-model="editedProfile.hobby" class="form-input" />
          </div>
          
          <div class="form-group">
            <label for="edit-charm">매력 포인트:</label>
            <textarea id="edit-charm" v-model="editedProfile.charm_points" class="form-textarea"></textarea>
          </div>
          
          <div class="form-group">
            <label for="edit-ideal">이상형:</label>
            <textarea id="edit-ideal" v-model="editedProfile.ideal_type" class="form-textarea"></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <!-- <div class="back-link">
      <router-link to="/" class="btn">홈으로 돌아가기</router-link>
    </div> -->
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem 0;
  max-width: 800px;
  margin: 0 auto;
}

.phone-verification-section {
  background-color: #f9f6f1;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid var(--primary-brown);
  margin-bottom: 1.5rem;
}

.verification-instruction {
  font-size: 0.9rem;
  color: var(--text-light);
  margin-bottom: 1rem;
  line-height: 1.4;
}

.highlight {
  color: var(--primary-brown);
  font-weight: bold;
}

.phone-verification-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.phone-display {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  font-size: 1.1rem;
  letter-spacing: 1px;
}

.visible-phone-part {
  color: var(--text-color);
  font-weight: 500;
}

.phone-separator {
  margin: 0 4px;
  color: #ccc;
}

.hidden-part {
  color: var(--text-light);
  letter-spacing: 2px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.last-four-digits {
  width: 100% !important;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  font-size: 1.1rem;
  letter-spacing: 2px;
  text-align: center;
  font-weight: 500;
  border: 2px solid var(--cream);
  transition: all 0.3s ease;
}

.last-four-digits:focus {
  border-color: var(--primary-brown);
  box-shadow: 0 0 0 3px rgba(169, 132, 103, 0.2);
}

.input-icon {
  position: absolute;
  right: 12px;
  color: var(--primary-brown);
  opacity: 0.7;
}

.page-title {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--dark-brown);
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.verification-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.profile-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--cream);
}

.profile-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.profile-row {
  display: flex;
  padding: 0.5rem 0;
}

.label {
  font-weight: bold;
  min-width: 120px;
  color: var(--text-light);
}

.value {
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: var(--text-light);
}

.form-input, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--cream);
  color: var(--dark-brown);
}

.primary-btn {
  background-color: var(--primary-brown);
  color: white;
}

.edit-btn {
  background-color: var(--secondary-brown);
  color: white;
}

.save-btn {
  background-color: var(--primary-brown);
  color: white;
  margin-right: 0.5rem;
}

.cancel-btn {
  background-color: #f8f8f8;
  color: var(--text-color);
  border: 1px solid #ddd;
}

.back-link {
  margin-top: 2rem;
  text-align: center;
}

.edit-actions {
  display: flex;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .profile-section, .verification-section {
    padding: 1.5rem;
  }
  
  .profile-row {
    flex-direction: column;
  }
  
  .label {
    margin-bottom: 0.25rem;
  }
}
</style>
