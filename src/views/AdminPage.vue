<template>
  <div class="admin-page">
    <div class="admin-header">
      <h2>Admin Page</h2>
    </div>

    <div class="admin-tabs">
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'manual' }" 
        @click="activeTab = 'manual'"
      >
        Manual Matching
      </button>
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'algorithm' }" 
        @click="activeTab = 'algorithm'"
      >
        Automatic Matching
      </button>
    </div>

    <div class="admin-content">
      <div class="admin-panel" v-if="activeTab === 'manual'">
        <h2>Manual Matching</h2>
        
        <div class="matching-section">
          <div class="selection-row">
            <div class="user-selection">
              <label for="user-a">User Selection:</label>
              <select 
                id="user-a" 
                v-model="selectedUserA" 
                class="user-select" 
                @change="loadUserDetails('A')"
                :disabled="loading">
                <option value="" disabled>Select User</option>
                <option v-for="user in userList" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.gender === '남자' ? '남성' : '여성' }})
                </option>
              </select>
            </div>
            
            <div class="user-selection">
              <label for="user-b">Matching Target:</label>
              <select 
                id="user-b" 
                v-model="selectedUserB" 
                class="user-select" 
                @change="loadUserDetails('B')"
                :disabled="loading || !selectedUserA">
                <option value="" disabled>Matching Target</option>
                <option v-for="user in filteredUserList" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.gender === '남자' ? '남성' : '여성' }})
                </option>
              </select>
            </div>
          </div>

          <div class="user-details" v-if="selectedUserA && selectedUserB">
            <div class="user-profiles">
              <div class="user-profile-card" v-if="userA">
                <h3>User A: {{ userA.name }}</h3>
                <div class="profile-details">
                  <p><strong>나이:</strong> {{ calculateAge(userA.birth_year) }}세</p>
                  <p><strong>성별:</strong> {{ userA.gender === '남자' ? '남성' : '여성' }}</p>
                  <p><strong>직업:</strong> {{ userA.field }}</p>
                  <p><strong>회사:</strong> {{ userA.company_name || '정보 없음' }}</p>
                  <p><strong>지역:</strong> {{ userA.location || '정보 없음' }}</p>
                  <p><strong>교회:</strong> {{ userA.church_name || '정보 없음' }}</p>
                  <p><strong>취미:</strong> {{ userA.hobby || '정보 없음' }}</p>
                  <p><strong>MBTI:</strong> {{ userA.mbti || '정보 없음' }}</p>
                  <p><strong>학력:</strong> {{ userA.education || '정보 없음' }}</p>
                  <p><strong>매력 포인트:</strong> {{ userA.charm_points || '정보 없음' }}</p>
                </div>
              </div>
              
              <div class="user-profile-card" v-if="userB">
                <h3>User B: {{ userB.name }}</h3>
                <div class="profile-details">
                  <p><strong>나이:</strong> {{ calculateAge(userB.birth_year) }}세</p>
                  <p><strong>성별:</strong> {{ userB.gender === '남자' ? '남성' : '여성' }}</p>
                  <p><strong>직업:</strong> {{ userB.field }}</p>
                  <p><strong>회사:</strong> {{ userB.company_name || '정보 없음' }}</p>
                  <p><strong>지역:</strong> {{ userB.location || '정보 없음' }}</p>
                  <p><strong>교회:</strong> {{ userB.church_name || '정보 없음' }}</p>
                  <p><strong>취미:</strong> {{ userB.hobby || '정보 없음' }}</p>
                  <p><strong>MBTI:</strong> {{ userB.mbti || '정보 없음' }}</p>
                  <p><strong>학력:</strong> {{ userB.education || '정보 없음' }}</p>
                  <p><strong>매력 포인트:</strong> {{ userB.charm_points || '정보 없음' }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="prompt-section" v-if="userA && userB">
            <h3>Matching Prompt Generation</h3>
            <div class="template-controls">
              <button @click="insertDefaultTemplate" class="template-button">Default Template</button>
              <button @click="clearTemplate" class="template-button">Clear Template</button>
            </div>
            <textarea 
              v-model="promptTemplate" 
              class="prompt-template"
              placeholder="여기에 프롬프트 템플릿을 작성하세요. {userA.name}, {userB.field}와 같이 사용자 정보를 참조할 수 있습니다."
              rows="10"></textarea>
            
            <div class="template-preview">
              <h4>프롬프트 미리보기</h4>
              <div class="preview-content">{{ renderTemplate() }}</div>
            </div>
            
            <div class="action-buttons">
              <button @click="copyToClipboard" class="copy-button">클립보드에 복사</button>
              <button @click="savePrompt" class="save-button" :disabled="!promptTemplate.trim()">저장하기</button>
            </div>
          </div>
        </div>
      </div>

      <div class="admin-panel" v-if="activeTab === 'algorithm'">
        <h2>Automatic Matching Algorithm</h2>
        <p class="algorithm-description">
          사용자를 선택하면 잠재적 매칭 대상들과의 호환성을 분석하여 보여줍니다.
          나이차, 지역 거리, MBTI 궁합, 직업 유사도, 이상형 우선순위 등을 비교하여 최적의 매칭을 찾아보세요.
        </p>
        <MatchingAlgorithm 
          :userList="userList" 
          :loading="loading"
          @match-selected="handleMatchSelected"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import supabase from '../supabase';
import MatchingAlgorithm from '../components/MatchingAlgorithm.vue';

// 상태 관리
const loading = ref(false);
const userList = ref([]);
const selectedUserA = ref('');
const selectedUserB = ref('');
const activeTab = ref('manual'); // 기본값은 수동 매칭 탭
const userA = ref(null);
const userB = ref(null);
const promptTemplate = ref('');
const savedPrompts = ref([]);
const notificationMessage = ref('');

// 필터링된 사용자 목록 (이미 선택된 사용자 A를 제외)
const filteredUserList = computed(() => {
  if (!selectedUserA.value) return userList.value;
  return userList.value.filter(user => user.id !== selectedUserA.value);
});

// 페이지 로드 시 사용자 목록 가져오기
onMounted(async () => {
  await fetchUsers();
});

// 출생연도로부터 나이 계산
function calculateAge(birthYear) {
  if (!birthYear) return '정보 없음';
  
  const currentYear = new Date().getFullYear();
  return currentYear - parseInt(birthYear);
}

// 사용자 목록 가져오기
async function fetchUsers() {
  try {
    loading.value = true;
    console.log('Fetching users from Supabase...');
    
    const { data, error } = await supabase
      .from('dating')
      .select('id, name, gender, birth_year, field, church_name, company_name, location, hobby, mbti, education, charm_points, ideal_type, ideal_type_priorities')
      .order('name');
      
    console.log('Supabase response data:', data);
    console.log('Supabase response error:', error);
      
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No users found in the dating table');
      userList.value = [];
    } else {
      userList.value = data;
      console.log('Loaded users:', userList.value.length);
    }
  } catch (err) {
    console.error('Error fetching users from Supabase:', err);
    userList.value = [];
  } finally {
    loading.value = false;
  }
}

// 사용자 상세 정보 가져오기
async function loadUserDetails(userType) {
  const userId = userType === 'A' ? selectedUserA.value : selectedUserB.value;
  
  if (!userId) return;
  
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('dating')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    
    if (userType === 'A') {
      userA.value = data;
    } else {
      userB.value = data;
    }
    
  } catch (err) {
    console.error(`Error fetching user ${userType} details:`, err);
  } finally {
    loading.value = false;
  }
}

// 기본 템플릿 삽입
function insertDefaultTemplate() {
  promptTemplate.value = `하나님의 인도하심 매칭 분석: ${userA.value.name} & ${userB.value.name}

1. 기본 프로필

${userA.value.name} 프로필:
- 나이: ${calculateAge(userA.value.birth_year)}세
- 성별: ${userA.value.gender === '남자' ? '남성' : '여성'}
- 직업: ${userA.value.field || '정보 없음'}
- 회사: ${userA.value.company_name || '정보 없음'}
- 교회: ${userA.value.church_name || '정보 없음'}
- MBTI: ${userA.value.mbti || '정보 없음'}
- 지역: ${userA.value.location || '정보 없음'}
- 특기사항: ${userA.value.charm_points || '정보 없음'}

${userB.value.name} 프로필:
- 나이: ${calculateAge(userB.value.birth_year)}세
- 성별: ${userB.value.gender === '남자' ? '남성' : '여성'}
- 직업: ${userB.value.field || '정보 없음'}
- 회사: ${userB.value.company_name || '정보 없음'}
- 교회: ${userB.value.church_name || '정보 없음'}
- MBTI: ${userB.value.mbti || '정보 없음'}
- 지역: ${userB.value.location || '정보 없음'}
- 특기사항: ${userB.value.charm_points || '정보 없음'}

2. 매칭 점수: ?/100

3. 매칭 이유:
- 
- 
- 

4. 문화적 조화:
- 
- 

5. 영적 조화:
- 
- 

6. 대화 주제 추천:
- 서로의 교회 경험과 신앙 여정
- 미래에 대한 비전과 가족 계획
- 함께 참여할 수 있는 봉사 활동

7. 성경적 충고:
"두 사람이 하나가 되는 것은 예수 그리스도와 교회의 관계와 같이 하나님의 지혜와 사랑을 나타내는 아름다운 연합입니다."

8. 기도 포인트:
- 
- `;
}

// 템플릿 지우기
function clearTemplate() {
  promptTemplate.value = '';
}

// 템플릿 렌더링 (변수 치환)
function renderTemplate() {
  if (!userA.value || !userB.value || !promptTemplate.value) {
    return '사용자를 모두 선택하고 템플릿을 작성하세요';
  }
  
  let rendered = promptTemplate.value;
  
  // userA 변수 치환
  Object.keys(userA.value).forEach(key => {
    rendered = rendered.replace(new RegExp(`{userA.${key}}`, 'g'), userA.value[key] || '정보 없음');
  });
  
  // userB 변수 치환
  Object.keys(userB.value).forEach(key => {
    rendered = rendered.replace(new RegExp(`{userB.${key}}`, 'g'), userB.value[key] || '정보 없음');
  });
  
  // 공통 관심사 찾기
  if (userA.value.interests && userB.value.interests) {
    const interestsA = userA.value.interests.split(',').map(i => i.trim());
    const interestsB = userB.value.interests.split(',').map(i => i.trim());
    const common = interestsA.filter(interest => interestsB.includes(interest));
    
    rendered = rendered.replace('{commonInterests}', common.length > 0 ? common.join(', ') : '공통 관심사가 없습니다');
  } else {
    rendered = rendered.replace('{commonInterests}', '정보 없음');
  }
  
  return rendered;
}

// 클립보드에 복사
function copyToClipboard() {
  const renderedText = renderTemplate();
  navigator.clipboard.writeText(renderedText)
    .then(() => {
      alert('클립보드에 복사되었습니다!');
    })
    .catch(err => {
      console.error('클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    });
}

// 프롬프트 저장하기
async function savePrompt() {
  try {
    loading.value = true;
    
    const { data, error } = await supabase
      .from('matching_prompts')
      .insert([
        { 
          user_a_id: selectedUserA.value,
          user_b_id: selectedUserB.value,
          prompt_template: promptTemplate.value,
          rendered_prompt: renderTemplate()
        }
      ]);
      
    if (error) throw error;
    
    alert('프롬프트가 저장되었습니다!');
  } catch (err) {
    console.error('Error saving prompt:', err);
    alert('프롬프트 저장에 실패했습니다.');
  } finally {
    loading.value = false;
  }
}

// 자동 매칭 알고리즘에서 매칭을 선택했을 때 처리
function handleMatchSelected({ mainUser, matchUser }) {
  // 수동 매칭 탭으로 전환하고 선택된 사용자 설정
  activeTab.value = 'manual';
  selectedUserA.value = mainUser.id;
  selectedUserB.value = matchUser.id;
  
  // 사용자 상세 정보 로드
  loadUserDetails('A');
  loadUserDetails('B');
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: #333;
  background-color: #f5f5f5;
}

.admin-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2rem;
  color: #333;
  font-weight: bold;
}

.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  background-color: #f0f0f0;
  color: #555;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  background-color: #3498db;
  color: white;
}

.tab-button:hover:not(.active) {
  background-color: #e0e0e0;
}

.admin-content {
  display: flex;
  gap: 2rem;
}

.admin-panel {
  flex: 1;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  color: #333;
}

.admin-panel h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #eee;
  color: #333;
}

.selection-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.user-selection {
  flex: 1;
}

.user-selection label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.user-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;
  color: #333;
  font-weight: 500;
}

.user-profiles {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.user-profile-card {
  flex: 1;
  padding: 1rem;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.user-profile-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.profile-details p {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.algorithm-description {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #3498db;
  color: #555;
  line-height: 1.5;
}

.prompt-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.template-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.template-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #e0e0e0;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  font-weight: 600;
}

.template-button:hover {
  background-color: #c8c8c8;
}

.prompt-template {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 1.5rem;
  background-color: #fff;
  color: #333;
}

.template-preview {
  background-color: #e9ecef;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1.5rem;
  color: #333;
}

.template-preview h4 {
  margin-bottom: 0.75rem;
  color: #333;
  font-weight: 600;
}

.preview-content {
  white-space: pre-wrap;
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.copy-button, .save-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
}

.copy-button {
  background-color: #e0e0e0;
  color: #333;
}

.save-button {
  background-color: #2980b9;
  color: white;
}

.copy-button:hover {
  background-color: #c8c8c8;
}

.save-button:hover {
  background-color: #1a5e8e;
}

.save-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  color: #f5f5f5;
}

@media (max-width: 768px) {
  .selection-row, .user-profiles {
    flex-direction: column;
  }
}
</style>
