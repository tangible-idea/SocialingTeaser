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
      <button 
        class="tab-button" 
        :class="{ active: activeTab === 'matchingList' }" 
        @click="activeTab = 'matchingList'; fetchMatchedUsers()"
      >
        Matching List
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
              :selectedMainUser="selectedUserA"
              @match-selected="handleMatchSelect" 
              @create-match="createMatch"
            />
      </div>
      
      <div class="admin-panel" v-if="activeTab === 'matchingList'">
        <h2>Matching List</h2>
        <p class="algorithm-description">
          현재까지 매칭된 사용자 목록입니다. 각 매칭에 대한 상태를 확인하고 관리할 수 있습니다.
        </p>
        
        <div class="matched-users-container">
          <div v-if="loadingMatchedUsers" class="loading-indicator">매칭 목록을 불러오는 중...</div>
          
          <div v-else-if="matchedUsersList.length === 0" class="no-matches">
            <p>매칭된 사용자가 없습니다.</p>
          </div>
          
          <div v-else class="matched-users-list">
            <div v-for="match in matchedUsersList" :key="match.id" class="match-item">
              <div class="match-users">
                <div class="match-user">
                  <h4>{{ match.user1.name }}</h4>
                  <p>{{ calculateAge(match.user1.birth_year) }}세, {{ match.user1.gender === '남자' ? '남성' : '여성' }}</p>
                  <p>{{ match.user1.field || '직업 정보 없음' }}</p>
                  <p>{{ match.user1.phone ? `연락처: ${match.user1.phone}` : '연락처 정보 없음' }}</p>
                  <p class="user-uuid">UUID: {{ match.user1.id }}</p>
                  <div class="user-actions">
                    <a :href="`/matching/${match.user1.id}`" class="view-link">여기서 보기</a>
                    <button @click="openSmsModal(match.user1, match.user2.id)" class="sms-button" :disabled="!match.user1.phone">SMS 보내기</button>
                  </div>
                </div>
                
                <div class="match-separator">—</div>
                
                <div class="match-user">
                  <h4>{{ match.user2.name }}</h4>
                  <p>{{ calculateAge(match.user2.birth_year) }}세, {{ match.user2.gender === '남자' ? '남성' : '여성' }}</p>
                  <p>{{ match.user2.field || '직업 정보 없음' }}</p>
                  <p>{{ match.user2.phone ? `연락처: ${match.user2.phone}` : '연락처 정보 없음' }}</p>
                  <p class="user-uuid">UUID: {{ match.user2.id }}</p>
                  <div class="user-actions">
                    <a :href="`/matching/${match.user2.id}`" class="view-link">여기서 보기</a>
                    <button @click="openSmsModal(match.user2, match.user1.id)" class="sms-button" :disabled="!match.user2.phone">SMS 보내기</button>
                  </div>
                </div>
              </div>
              
              <div class="match-info">
                <p class="match-date">매칭일: {{ new Date(match.matched_at).toLocaleDateString() }}</p>
                <p class="match-status" :class="{'status-active': match.status === 'active', 'status-inactive': match.status !== 'active'}">상태: {{ match.status === 'active' ? '활성' : '비활성' }}</p>
              </div>
              
              <!-- 미팅 일정과 장소 정보 -->
              <div class="meeting-info">
                <div class="meeting-item">
                  <span class="meeting-label">미팅 일정:</span>
                  <span v-if="!isEditingDate(match.id)" class="meeting-value">
                    {{ match.meeting_date ? formatDateTime(match.meeting_date) : '설정되지 않음' }}
                    <button @click="startEditDate(match)" class="edit-button">변경</button>
                  </span>
                </div>
                
                <div class="meeting-item">
                  <span class="meeting-label">미팅 장소:</span>
                  <span v-if="!isEditingLocation(match.id)" class="meeting-value">
                    {{ match.meeting_place || '설정되지 않음' }}
                    <button @click="startEditLocation(match)" class="edit-button">변경</button>
                  </span>
                  <span v-else class="meeting-value-edit">
                    <input 
                      v-model="newLocation" 
                      @keyup.enter="saveLocation(match)"
                      class="location-input"
                      placeholder="미팅 장소를 입력하세요"
                    />
                    <div class="edit-actions">
                      <button @click="saveLocation(match)" class="save-location-button">저장</button>
                      <button @click="cancelEditLocation()" class="cancel-button">취소</button>
                    </div>
                  </span>
                </div>
                
                <!-- 매칭 코멘트 정보 -->
                <div class="meeting-item">
                  <span class="meeting-label">매칭 코멘트:</span>
                  <span v-if="!isEditingComment(match.id)" class="meeting-value">
                    {{ match.admin_comment || '설정되지 않음' }}
                    <button @click="startEditComment(match)" class="edit-button">변경</button>
                  </span>
                  <span v-else class="meeting-value-edit">
                    <textarea 
                      v-model="newComment" 
                      class="comment-input"
                      placeholder="매칭에 대한 코멘트를 입력하세요"
                      rows="3"
                    ></textarea>
                    <div class="edit-actions">
                      <button @click="saveComment(match)" class="save-comment-button">저장</button>
                      <button @click="cancelEditComment()" class="cancel-button">취소</button>
                    </div>
                  </span>
                </div>
              </div>
              
              <div class="match-actions">
                <button @click="toggleMatchStatus(match)" class="status-toggle-button">
                  {{ match.status === 'active' ? '비활성화' : '활성화' }}
                </button>
                <button @click="deleteMatch(match)" class="delete-button">삭제</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 날짜 선택 모달 -->
  <div class="modal date-modal" v-if="showDatePicker">
    <div class="modal-content calendar-content">
      <h3>미팅 일정 설정</h3>
      <div class="datepicker-wrapper">
        <Datepicker 
          v-model="selectedDateTime" 
          :enable-time-picker="true"
          :is24="true"
          :minutes-increment="15"
          :text-input="false"
          :auto-apply="true"
          :preview-format="'yyyy년 MM월 dd일 HH:mm'"
          placeholder="날짜와 시간을 선택해주세요"
          locale="ko"
          model-type="timestamp"
          class="mobile-datepicker"
        />
      </div>
      <div class="modal-actions">
        <button class="cancel-button" @click="cancelEditDate()">취소</button>
        <button class="save-button" @click="saveDate()">저장</button>
      </div>
    </div>
  </div>

  <!-- SMS 전송 확인 모달 -->
  <div class="modal sms-modal" v-if="showSmsModal">
    <div class="modal-content sms-content">
      <h3>SMS 전송 확인</h3>
      <div class="sms-details">
        <p><strong>받는 사람:</strong> {{ smsRecipient.name }} ({{ smsRecipient.phone }})</p>
        <div class="sms-message-preview">
          <p><strong>메시지 내용:</strong></p>
          <p class="message-text">[텐저블데이팅] 안녕하세요. {{ smsRecipient.name }}님께 좋은 인연을 찾았어요! 아래 링크에서 확인해보세요. 왜 두 분이 적합한 인연인지 메시지와 함께 간략한 프로필을 함께 볼 수 있도록 링크를 만들었습니다. 서로 질문카드를 하루에 1개씩만 보낼 수 있고, 긴 이야기는 만나서 할 수 있도록 권장하도록 짜여진 시스템입니다. 좋은 인연이 되기를 응원합니다!  https://social.tangibly.link/matching/{{ matchedUserId }}</p>
        </div>
      </div>
      <div class="modal-actions">
        <button class="cancel-button" @click="cancelSmsModal()">취소</button>
        <button class="send-button" @click="sendSms()" :disabled="sendingSms">{{ sendingSms ? '전송 중...' : 'SMS 전송' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import supabase from '../supabase';
import MatchingAlgorithm from '../components/MatchingAlgorithm.vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

// 상태 관리
const loading = ref(false);
const userList = ref([]);
const selectedUserA = ref('');
const selectedUserB = ref('');
const activeTab = ref('manual'); // 기본값은 수동 매칭 탭
const userA = ref(null);
const userB = ref(null);

// 매칭 목록 관련 상태
const loadingMatchedUsers = ref(false);
const matchedUsersList = ref([]);
const promptTemplate = ref('');
const savedPrompts = ref([]);
const notificationMessage = ref('');

// SMS 관련 상태
const showSmsModal = ref(false);
const smsRecipient = ref(null);
const matchedUserId = ref('');
const sendingSms = ref(false);

// 일정 및 장소 편집 관련 상태
const editingMatchId = ref(null);
const showDatePicker = ref(false);
const selectedDateTime = ref(null);
const editingLocation = ref(false);
const newLocation = ref('');
const currentEditMatch = ref(null);

// 코멘트 편집 관련 상태
const editingComment = ref(false);
const newComment = ref('');

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
      .select('id, name, gender, birth_year, field, church_name, company_name, location, hobby, mbti, education, charm_points, ideal_type, ideal_type_priorities, phone')
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

// 매치 선택 처리
function handleMatchSelect(match) {
  selectedUserB.value = match.matchUser.id;
  loadUserDetails('B');
}

// 두 유저를 매칭하고 dating_matched 테이블에 저장
async function createMatch({ user1Id, user2Id }) {
  try {
    if (!user1Id || !user2Id) {
      alert('매칭할 유저 정보가 없습니다.');
      return;
    }
    
    // 이미 매칭된 사용자인지 확인
    const { data: existingMatch } = await supabase
      .from('dating_matched')
      .select('*')
      .or(`user1_id.eq.${user1Id},user1_id.eq.${user2Id},user2_id.eq.${user1Id},user2_id.eq.${user2Id}`);
    
    if (existingMatch && existingMatch.length > 0) {
      alert('이미 매칭된 사용자입니다.');
      return;
    }
    
    // 매칭 정보 저장
    const { data, error } = await supabase
      .from('dating_matched')
      .insert([
        {
          user1_id: user1Id,
          user2_id: user2Id,
          matched_at: new Date().toISOString(),
          status: 'active'
        }
      ]);
      
    if (error) {
      throw error;
    }
    
    alert('매칭이 성공적으로 저장되었습니다!');
    
    // 매칭 리스트 탭을 보고 있다면 새로고침
    if (activeTab.value === 'matchingList') {
      fetchMatchedUsers();
    }
    
  } catch (error) {
    console.error('매칭 중 오류 발생:', error);
    alert(`매칭 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 날짜/시간 포맷팅 함수
function formatDateTime(dateString) {
  if (!dateString) return '설정되지 않음';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '유효하지 않은 날짜';
  
  // 한국어 요일 배열
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}년 ${month}월 ${day}일 ${weekday}요일 ${hour}시 ${minute}분`;
}

// 일정 수정 시작
function startEditDate(match) {
  currentEditMatch.value = match;
  editingMatchId.value = match.id;
  
  // 기존 날짜가 있으면 설정, 없으면 현재 시간으로 설정
  if (match.meeting_date) {
    selectedDateTime.value = new Date(match.meeting_date).getTime();
  } else {
    selectedDateTime.value = new Date().getTime();
  }
  
  showDatePicker.value = true;
}

// 일정 수정 취소
function cancelEditDate() {
  showDatePicker.value = false;
  editingMatchId.value = null;
  currentEditMatch.value = null;
  selectedDateTime.value = null;
}

// 일정 저장
async function saveDate() {
  if (!currentEditMatch.value || !selectedDateTime.value) {
    alert('날짜와 시간을 선택해주세요.');
    return;
  }
  
  try {
    // timestamptz로 저장하기 위해 ISO 형식으로 변환
    const isoDate = new Date(selectedDateTime.value).toISOString();
    
    const { error } = await supabase
      .from('dating_matched')
      .update({ meeting_date: isoDate })
      .eq('id', currentEditMatch.value.id);
      
    if (error) throw error;
    
    // 현재 편집 중인 객체에 새 날짜 설정
    currentEditMatch.value.meeting_date = isoDate;
    
    alert('미팅 일정이 업데이트되었습니다.');
    showDatePicker.value = false;
    editingMatchId.value = null;
    currentEditMatch.value = null;
  } catch (err) {
    console.error('일정 수정 중 오류:', err);
    alert('일정 수정에 실패했습니다.');
  }
}

// 장소 수정 시작
function startEditLocation(match) {
  editingMatchId.value = match.id;
  editingLocation.value = true;
  newLocation.value = match.meeting_place || '';
  currentEditMatch.value = match;
}

// 장소 수정 취소
function cancelEditLocation() {
  editingLocation.value = false;
  editingMatchId.value = null;
  newLocation.value = '';
  currentEditMatch.value = null;
}

// 장소 저장
async function saveLocation(match) {
  try {
    const { error } = await supabase
      .from('dating_matched')
      .update({ meeting_place: newLocation.value })
      .eq('id', match.id);
      
    if (error) throw error;
    
    // 현재 편집 중인 객체에 새 장소 설정
    match.meeting_place = newLocation.value;
    
    editingLocation.value = false;
    editingMatchId.value = null;
    newLocation.value = '';
    currentEditMatch.value = null;
    
    alert('미팅 장소가 업데이트되었습니다.');
  } catch (err) {
    console.error('장소 수정 중 오류:', err);
    alert('장소 수정에 실패했습니다.');
  }
}

// 현재 수정 중인 일정인지 확인
function isEditingDate(matchId) {
  return editingMatchId.value === matchId && showDatePicker.value;
}

// 현재 수정 중인 장소인지 확인
function isEditingLocation(matchId) {
  return editingMatchId.value === matchId && editingLocation.value;
}

// 현재 수정 중인 코멘트인지 확인
function isEditingComment(matchId) {
  return editingMatchId.value === matchId && editingComment.value;
}

// 코멘트 편집 시작
function startEditComment(match) {
  editingMatchId.value = match.id;
  editingComment.value = true;
  newComment.value = match.admin_comment || '';
  currentEditMatch.value = match;
}

// 코멘트 편집 취소
function cancelEditComment() {
  editingComment.value = false;
  editingMatchId.value = null;
  newComment.value = '';
  currentEditMatch.value = null;
}

// 코멘트 저장 및 dating_chat 에 시스템 메시지 추가
async function saveComment(match) {
  try {
    if (!newComment.value.trim()) {
      alert('코멘트를 입력해주세요.');
      return;
    }
    
    // 1. dating_matched 테이블에 admin_comment 업데이트
    const { error } = await supabase
      .from('dating_matched')
      .update({ admin_comment: newComment.value })
      .eq('id', match.id);
      
    if (error) throw error;
    
    // 2. dating_chat 테이블에 시스템 메시지 추가
    const { error: chatError } = await supabase
      .from('dating_chat')
      .insert({
        matching_id: match.id,
        sender_id: null,  // 시스템 메시지
        message: `[관리자 코멘트] ${newComment.value}`,
        message_type: 'system'
      });
      
    if (chatError) throw chatError;
    
    // 3. UI에 보이는 매칭 데이터 업데이트
    match.admin_comment = newComment.value;
    
    editingComment.value = false;
    editingMatchId.value = null;
    newComment.value = '';
    currentEditMatch.value = null;
    
    alert('코멘트가 업데이트되었습니다.');
  } catch (err) {
    console.error('코멘트 수정 중 오류:', err);
    alert('코멘트 수정에 실패했습니다.');
  }
}

// 매칭된 사용자 목록 가져오기
async function fetchMatchedUsers() {
  try {
    loadingMatchedUsers.value = true;
    
    // 매칭 정보 가져오기
    const { data: matchesData, error: matchesError } = await supabase
      .from('dating_matched')
      .select('*')
      .order('matched_at', { ascending: false });
      
    if (matchesError) throw matchesError;
    
    // 사용자 ID 목록 추출
    const userIds = new Set();
    matchesData.forEach(match => {
      userIds.add(match.user1_id);
      userIds.add(match.user2_id);
    });
    
    // 모든 관련 사용자 정보 가져오기
    const { data: usersData, error: usersError } = await supabase
      .from('dating')
      .select('*')
      .in('id', Array.from(userIds));
      
    if (usersError) throw usersError;
    
    // 사용자 정보 매핑
    const usersMap = {};
    usersData.forEach(user => {
      usersMap[user.id] = user;
    });
    
    // 매칭 정보와 사용자 정보 결합
    matchedUsersList.value = matchesData.map(match => ({
      ...match,
      user1: usersMap[match.user1_id],
      user2: usersMap[match.user2_id]
    }));
    
  } catch (error) {
    console.error('매칭 목록 가져오기 중 오류:', error);
    alert(`매칭 목록을 가져오는 중 오류가 발생했습니다: ${error.message}`);
  } finally {
    loadingMatchedUsers.value = false;
  }
}

// 매칭 상태 변경(활성/비활성)
async function toggleMatchStatus(match) {
  try {
    const newStatus = match.status === 'active' ? 'inactive' : 'active';
    
    const { error } = await supabase
      .from('dating_matched')
      .update({ status: newStatus })
      .eq('id', match.id);
      
    if (error) throw error;
    
    // 화면에서 상태 변경
    match.status = newStatus;
    
    alert(`매칭 상태가 '${newStatus === 'active' ? '활성' : '비활성'}'으로 변경되었습니다.`);
    
  } catch (error) {
    console.error('매칭 상태 변경 중 오류:', error);
    alert(`매칭 상태를 변경하는 중 오류가 발생했습니다: ${error.message}`);
  }
}

// 매칭 삭제
async function deleteMatch(match) {
  if (!confirm('정말로 이 매칭을 삭제하시겠습니까?')) return;
  
  try {
    const { error } = await supabase
      .from('dating_matched')
      .delete()
      .eq('id', match.id);
      
    if (error) throw error;
    
    // 목록에서 삭제된 매칭 제거
    matchedUsersList.value = matchedUsersList.value.filter(item => item.id !== match.id);
    
    alert('매칭이 성공적으로 삭제되었습니다.');
    
  } catch (error) {
    console.error('매칭 삭제 중 오류:', error);
    alert(`매칭을 삭제하는 중 오류가 발생했습니다: ${error.message}`);
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

// SMS 모달 열기
function openSmsModal(user, partnerId) {
  if (!user.phone) {
    alert('사용자의 전화번호 정보가 없습니다.');
    return;
  }
  
  smsRecipient.value = user;
  matchedUserId.value = user.id; // 파트너 아이디가 아니라 SMS 받는 사람(user)의 id를 사용
  showSmsModal.value = true;
}

// SMS 모달 닫기
function cancelSmsModal() {
  showSmsModal.value = false;
  smsRecipient.value = null;
  matchedUserId.value = '';
}

// SMS 전송
async function sendSms() {
  if (!smsRecipient.value || !smsRecipient.value.phone) {
    alert('전화번호 정보가 없습니다.');
    return;
  }
  
  try {
    sendingSms.value = true;
    
    const response = await fetch('https://api.tangibly.link/chat/sendsms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: smsRecipient.value.phone,
        message: `[텐저블데이팅] 안녕하세요. ${smsRecipient.value.name}님께 좋은 인연을 찾았어요! 아래 링크에서 확인해보세요. 왜 두 분이 적합한 인연인지 메시지와 함께 간략한 프로필을 함께 볼 수 있도록 링크를 만들었습니다. 서로 질문카드를 하루에 1개씩 보낼 수 있으며, 긴 이야기는 만나서 할 수 있도록 시스템을 만들었습니다. 좋은 인연이 되기를 응원합니다!  https://social.tangibly.link/matching/${matchedUserId.value}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`SMS 전송 실패: ${response.status}`);
    }
    
    const result = await response.json();
    alert('SMS가 성공적으로 전송되었습니다.');
    cancelSmsModal();
    
  } catch (error) {
    console.error('SMS 전송 중 오류:', error);
    alert(`SMS 전송 중 오류가 발생했습니다: ${error.message}`);
  } finally {
    sendingSms.value = false;
  }
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

/* 매칭 목록 스타일 */
.matched-users-container {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.loading-indicator {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}

.no-matches {
  text-align: center;
  padding: 30px;
  color: #666;
  border: 1px dashed #ddd;
  border-radius: 6px;
}

.match-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.match-users {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.match-user {
  flex: 1;
  padding: 10px;
}

.match-user h4 {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 18px;
}

.match-user p {
  margin: 3px 0;
  color: #666;
  font-size: 14px;
}

.user-uuid {
  font-size: 12px;
  color: #888;
  font-family: monospace;
}

.view-link {
  display: inline-block;
  margin-top: 5px;
  padding: 4px 8px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.view-link:hover {
  background-color: #2980b9;
}

.user-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.sms-button {
  padding: 4px 8px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sms-button:hover {
  background-color: #219653;
}

.sms-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

/* SMS Modal Styles */
.sms-content {
  width: 90%;
  max-width: 500px;
}

.sms-details {
  margin: 15px 0;
}

.sms-message-preview {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.send-button {
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
}

.send-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.match-separator {
  color: #ccc;
  margin: 0 15px;
  font-size: 18px;
}

/* Meeting info styles */
.meeting-info {
  margin: 15px 0;
  padding: 15px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.meeting-item {
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.meeting-label {
  font-weight: bold;
  min-width: 100px;
  color: #555;
}

.meeting-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #333;
}

.meeting-value-edit {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.edit-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin-left: 10px;
  font-size: 12px;
  cursor: pointer;
}

.location-input, .comment-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 8px;
}

.comment-input {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.save-location-button, .save-comment-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}

/* Date picker modal styles */
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 15px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.calendar-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.datepicker-wrapper {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
  width: 100%;
}

.mobile-datepicker {
  width: 100%;
  --dp-font-family: inherit;
  --dp-border-radius: 8px;
  --dp-cell-border-radius: 4px;
  --dp-common-transition: all ease 0.2s;
  --dp-menu-padding: 6px 8px;
  --dp-animation-duration: 0.2s;
  --dp-background-color: #fff;
  --dp-border-color: #ddd;
  --dp-border-color-hover: #aaaeb7;
  --dp-text-color: #212121;
  --dp-disabled-color: #c0c4cc;
  --dp-hover-color: #f5f5f5;
  --dp-btn-hover-bg-color: #f8f8f8;
  --dp-primary-color: #1976d2;
}

/* Fix mobile display */
.dp__main {
  width: 100% !important;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.save-button {
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
}

.match-info {
  display: flex;
  justify-content: space-between;
  padding: 10px 5px;
  font-size: 14px;
  color: #666;
}

.match-date {
  font-style: italic;
}

.match-status {
  font-weight: bold;
}

.status-active {
  color: #4CAF50;
}

.status-inactive {
  color: #f44336;
}

.match-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}

.status-toggle-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .selection-row, .user-profiles {
    flex-direction: column;
  }
  
  .match-separator {
    margin: 0 10px;
  }
}
</style>
