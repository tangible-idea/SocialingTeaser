<template>
  <div class="matching-detail-page">
    <div class="page-header">
      <h1>매칭 상세 정보</h1>
    </div>
    
    <div class="loading-container" v-if="loading">
      <p class="loading-text">매칭 정보를 불러오는 중...</p>
    </div>
    
    <div class="error-container" v-else-if="error">
      <div class="error-message">
        <h2>{{ error }}</h2>
        <p>매칭 정보를 불러오는 중 문제가 발생했습니다.</p>
      </div>
    </div>
    
    <div class="no-match-container" v-else-if="!matchData">
      <div class="no-match-content">
        <div class="sad-face">😔</div>
        <h2>아직 매칭 내역이 없습니다</h2>
        <p>관리자가 매칭을 진행하면 이곳에서 확인할 수 있습니다.</p>
      </div>
    </div>
    
    <div class="match-detail-container" v-else>
      <div class="match-info-card">
        <h2>매칭 정보</h2>
        
        <div class="partner-info">
          <div class="partner-avatar">
            <img src="/profile-placeholder.png" alt="프로필" onerror="this.src='https://via.placeholder.com/80'" />
          </div>
          <div class="partner-details">
            <h3>{{ partnerInfo.name }}</h3>
            <p>{{ calculateAge(partnerInfo.birth_year) }}세, {{ partnerInfo.field || '정보 없음' }}</p>
          </div>
        </div>
        
        <div class="meeting-info">
          <div class="info-row">
            <span class="info-label">일정:</span>
            <span class="info-value">{{ matchData.meeting_date || '아직 정해지지 않았습니다' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">장소:</span>
            <span class="info-value">{{ matchData.meeting_place || '아직 정해지지 않았습니다' }}</span>
          </div>
        </div>
        
        <div class="chat-container">
          <div class="chat-messages">
            <div class="system-message">
              <p>{{ currentDate }} 매칭이 성사되었습니다.</p>
            </div>
            
            <div v-if="matchData.meeting_date" class="system-message">
              <p>관리자가 미팅 일정을 {{ matchData.meeting_date }}로 설정했습니다.</p>
            </div>
            
            <div v-if="matchData.meeting_place" class="system-message">
              <p>미팅 장소가 {{ matchData.meeting_place }}로 설정되었습니다.</p>
            </div>
            
            <div v-for="(message, index) in actionMessages" :key="index" class="action-message">
              <p>{{ message }}</p>
            </div>
          </div>
          
          <div class="chat-actions">
            <button class="action-button accept-button" @click="acceptSchedule">
              일정 수락
            </button>
            
            <div class="change-date-container">
              <input 
                type="text" 
                v-model="newDate" 
                placeholder="변경할 일정 입력"
                class="date-input">
              <button class="action-button change-button" @click="requestChange">
                일정 변경
              </button>
            </div>
            
            <button class="action-button question-button" @click="showQuestionModal = true">
              질문 보내기
            </button>
          </div>
        </div>
      </div>
      
      <!-- 질문 모달 -->
      <div class="modal" v-if="showQuestionModal">
        <div class="modal-content">
          <h3>질문 보내기</h3>
          <textarea 
            v-model="questionText" 
            placeholder="상대방에게 질문할 내용을 입력하세요"
            rows="4"
            class="question-textarea"></textarea>
          <div class="modal-actions">
            <button class="cancel-button" @click="showQuestionModal = false">취소</button>
            <button class="send-button" @click="sendQuestion">보내기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import supabase from '../supabase';

const route = useRoute();
const userUuid = route.params.uuid;

const loading = ref(true);
const error = ref(null);
const matchData = ref(null);
const partnerInfo = ref({});
const currentUserInfo = ref({});
const actionMessages = ref([]);
const newDate = ref('');
const showQuestionModal = ref(false);
const questionText = ref('');

// 현재 날짜 포맷
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

onMounted(async () => {
  await fetchUserData();
  await fetchMatchingData();
});

async function fetchUserData() {
  try {
    // 현재 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('dating')
      .select('*')
      .eq('id', userUuid)
      .single();
      
    if (userError) throw userError;
    
    currentUserInfo.value = userData;
  } catch (err) {
    console.error('사용자 정보를 불러오는 중 오류 발생:', err);
  }
}

async function fetchMatchingData() {
  try {
    loading.value = true;
    error.value = null;
    
    // 현재 사용자가 참여한 매칭 정보 조회
    const { data: matchingData, error: matchingError } = await supabase
      .from('dating_matched')
      .select('*')
      .or(`user1_id.eq.${userUuid},user2_id.eq.${userUuid}`)
      .eq('status', 'active')
      .limit(1)
      .single();
      
    if (matchingError) {
      if (matchingError.code === 'PGRST116') {
        // 매칭 데이터가 없음 (single 결과가 없을 때)
        matchData.value = null;
        loading.value = false;
        return;
      } else {
        throw matchingError;
      }
    }
    
    // 매칭 데이터가 있으면 저장
    matchData.value = matchingData;
    
    // 파트너 ID 확인 (현재 사용자가 아닌 사람)
    const partnerId = matchingData.user1_id === userUuid 
      ? matchingData.user2_id 
      : matchingData.user1_id;
      
    // 파트너 정보 조회
    const { data: userData, error: userError } = await supabase
      .from('dating')
      .select('*')
      .eq('id', partnerId)
      .single();
      
    if (userError) throw userError;
    
    partnerInfo.value = userData;
    
  } catch (err) {
    console.error('매칭 정보를 불러오는 중 오류 발생:', err);
    error.value = '매칭 정보를 불러올 수 없습니다';
  } finally {
    loading.value = false;
  }
}

// 일정 수락 함수
async function acceptSchedule() {
  if (!matchData.value || !matchData.value.meeting_date) {
    alert('수락할 일정이 없습니다.');
    return;
  }
  
  const message = `${currentUserInfo.value.name}님이 일정을 수락하셨습니다.`;
  actionMessages.value.push(message);
  
  // TODO: 서버에 수락 상태 저장 로직 추가
}

// 일정 변경 요청 함수
async function requestChange() {
  if (!newDate.value) {
    alert('변경할 일정을 입력해주세요.');
    return;
  }
  
  const message = `${currentUserInfo.value.name}님이 ${newDate.value}로 일정변경을 요청하셨습니다.`;
  actionMessages.value.push(message);
  newDate.value = '';
  
  // TODO: 서버에 변경 요청 저장 로직 추가
}

// 질문 보내기 함수
async function sendQuestion() {
  if (!questionText.value.trim()) {
    alert('질문 내용을 입력해주세요.');
    return;
  }
  
  const message = `${currentUserInfo.value.name}님: ${questionText.value}`;
  actionMessages.value.push(message);
  
  showQuestionModal.value = false;
  questionText.value = '';
  
  // TODO: 서버에 질문 저장 로직 추가
}

function calculateAge(birthYear) {
  if (!birthYear) return '알 수 없음';
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}
</script>

<style scoped>
.matching-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.8rem;
  color: #333;
}

.loading-container, .error-container, .no-match-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  text-align: center;
}

.loading-text {
  font-size: 1.2rem;
  color: #666;
}

.error-message {
  color: #e74c3c;
}

.no-match-content {
  text-align: center;
}

.sad-face {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #95a5a6;
}

.match-info-card {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
}

.match-info-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* 파트너 정보 스타일 */
.partner-info {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.partner-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
  flex-shrink: 0;
}

.partner-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.partner-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.3rem;
  color: #333;
}

.partner-details p {
  margin: 0;
  color: #666;
}

/* 미팅 정보 스타일 */
.meeting-info {
  margin-bottom: 1.5rem;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: bold;
  width: 80px;
  color: #555;
}

.info-value {
  color: #333;
}

/* 채팅 컨테이너 스타일 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f0f2f5;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

/* 시스템 메시지 스타일 */
.system-message {
  align-self: center;
  padding: 0.5rem 1rem;
  background-color: #e2e3e5;
  border-radius: 15px;
  margin-bottom: 0.8rem;
  max-width: 90%;
}

.system-message p {
  margin: 0;
  font-size: 0.9rem;
  color: #3a3a3a;
}

/* 액션 메시지 스타일 */
.action-message {
  align-self: flex-start;
  padding: 0.8rem 1rem;
  background-color: #ffffff;
  border-radius: 15px;
  margin-bottom: 0.8rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 80%;
}

.action-message p {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

/* 채팅 액션 버튼 스타일 */
.chat-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.accept-button {
  background-color: #2ecc71;
  color: white;
  flex: 1;
}

.change-date-container {
  display: flex;
  flex: 2;
  gap: 0.5rem;
}

.date-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.95rem;
}

.change-button {
  background-color: #3498db;
  color: white;
}

.question-button {
  background-color: #f39c12;
  color: white;
  flex: 1;
}

.action-button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 5px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover {
  opacity: 0.9;
}

/* 모달 스타일 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.question-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  margin-bottom: 1rem;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.send-button {
  padding: 0.75rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .chat-actions {
    flex-direction: column;
  }
  
  .change-date-container {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>
