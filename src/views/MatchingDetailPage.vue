<template>
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
        <div class="profiles-container">
          <!-- 상대방 정보 -->
          <div class="profile-card partner-card">
            <div class="profile-header">
              <h4>상대방 정보</h4>
            </div>
            <div class="profile-content">
              <div class="profile-avatar">
                <img src="/profile-placeholder.png" alt="상대방 프로필" onerror="this.src='https://via.placeholder.com/80'" />
              </div>
              <div class="profile-details">
                <div class="profile-name">{{ partnerInfo.name }}</div>
                <div class="profile-info">{{ formatBirthYear(partnerInfo.birth_year) }}, {{ partnerInfo.field || '정보 없음' }}</div>
                <div class="profile-info">키: {{ partnerInfo.height || '정보 없음' }}cm</div>
                <div class="profile-info">MBTI: {{ partnerInfo.mbti || '정보 없음' }}</div>
              </div>
            </div>
          </div>
          
          <!-- 내 정보 -->
          <div class="profile-card my-card">
            <div class="profile-header">
              <h4>내 정보</h4>
              <button class="edit-button" @click="openProfileEditor">
                <span class="edit-icon">✏️</span> 수정
              </button>
            </div>
            <div class="profile-content">
              <div class="profile-avatar">
                <img src="/profile-placeholder.png" alt="내 프로필" onerror="this.src='https://via.placeholder.com/80'" />
              </div>
              <div class="profile-details">
                <div class="profile-name">{{ currentUserInfo.name }}</div>
                <div class="profile-info">{{ formatBirthYear(currentUserInfo.birth_year) }}, {{ currentUserInfo.field || '정보 없음' }}</div>
                <div class="profile-info">키: {{ currentUserInfo.height || '정보 없음' }}cm</div> 
                <div class="profile-info">MBTI: {{ currentUserInfo.mbti || '정보 없음' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="meeting-info">
          <div class="info-row">
            <span class="info-label">일정:</span>
            <span class="info-value">{{ matchData.meeting_date ? formatMeetingDate(matchData.meeting_date) : '아직 정해지지 않았습니다' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">장소:</span>
            <span class="info-value">{{ matchData.meeting_place || '아직 정해지지 않았습니다' }}</span>
          </div>
          
          <div class="meeting-actions">
            <!-- 현재 사용자가 수락했는지 확인 -->
            <div v-if="matchData.user1_id === userUuid ? matchData.user1_accepted : matchData.user2_accepted">
              <button class="action-button cancel-button" @click="cancelSchedule">
                일정 수락 취소
              </button>
            </div>
            <div v-else>
              <button class="action-button accept-button" @click="acceptSchedule">
                일정 수락
              </button>
            </div>
            
            <div class="change-date-container">
              <button class="action-button change-button" @click="openDatePicker">
                일정 변경
              </button>
            </div>
          </div>
        </div>
        
        <div class="chat-container">
          <div class="chat-messages">
            <!-- <div class="system-message">
              <p>{{ currentDate }} 매칭이 성사되었습니다.</p>
            </div> -->
            
            <!-- <div v-if="matchData.meeting_date" class="system-message">
              <p>관리자가 미팅 일정을 {{ matchData.meeting_date }}로 설정했습니다.</p>
            </div>
            
            <div v-if="matchData.meeting_place" class="system-message">
              <p>미팅 장소가 {{ matchData.meeting_place }}로 설정되었습니다.</p>
            </div> -->
            
            <div v-for="message in chatMessages" :key="message.id" 
                :class="message.message_type === 'system' ? 'system-message' : 'action-message'">
              <p>{{ message.message }}</p>
              <span v-if="message.message_type !== 'system'" class="message-time">{{ formatTime(message.created_at) }}</span>
            </div>
          </div>
          
          <div class="chat-actions">
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
      
      <!-- 프로필 수정 모달 -->
      <div class="modal profile-edit-modal" v-if="showProfileEditor">
        <div class="modal-content">
          <h3>내 정보 수정</h3>
          <form @submit.prevent="saveProfileChanges">
            <div class="form-group">
              <label for="name">이름</label>
              <input type="text" id="name" v-model="editedProfile.name" />
            </div>
            <div class="form-group">
              <label for="field">직업/분야</label>
              <input type="text" id="field" v-model="editedProfile.field" />
            </div>
            <div class="form-group">
              <label for="height">키 (cm)</label>
              <input type="number" id="height" v-model="editedProfile.height" />
            </div>
            <div class="form-group">
              <label for="mbti">MBTI</label>
              <select id="mbti" v-model="editedProfile.mbti">
                <option value="">선택안함</option>
                <option value="ISTJ">ISTJ</option>
                <option value="ISFJ">ISFJ</option>
                <option value="INFJ">INFJ</option>
                <option value="INTJ">INTJ</option>
                <option value="ISTP">ISTP</option>
                <option value="ISFP">ISFP</option>
                <option value="INFP">INFP</option>
                <option value="INTP">INTP</option>
                <option value="ESTP">ESTP</option>
                <option value="ESFP">ESFP</option>
                <option value="ENFP">ENFP</option>
                <option value="ENTP">ENTP</option>
                <option value="ESTJ">ESTJ</option>
                <option value="ESFJ">ESFJ</option>
                <option value="ENFJ">ENFJ</option>
                <option value="ENTJ">ENTJ</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="cancel-button" @click="showProfileEditor = false">취소</button>
              <button type="submit" class="send-button">저장</button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 날짜 선택 모달 -->
      <div v-if="showDatePicker" class="modal date-modal">
        <div class="modal-content calendar-content">
          <h3>일정 변경하기</h3>
          <div class="datepicker-wrapper">
            <Datepicker 
              v-model="selectedDateTime" 
              :enable-time-picker="true"
              :is24="true"
              :min-time="minTime"
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
            <button class="cancel-button" @click="showDatePicker = false">취소</button>
            <button class="send-button" @click="submitDateChange">확인</button>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { useRoute } from 'vue-router';
import supabase from '../supabase';

const route = useRoute();
const userUuid = route.params.uuid;

const loading = ref(true);
const error = ref(null);
const matchData = ref(null);
const partnerInfo = ref({});
const currentUserInfo = ref({});
// Used to store messages from the chat table
const chatMessages = ref([]);
let subscription = null; // Supabase Realtime subscription
const showDatePicker = ref(false);
const selectedDateTime = ref(null);
const minTime = { hours: 0, minutes: 0 };
const showQuestionModal = ref(false);
const questionText = ref('');

// 프로필 수정 관련 변수
// 프로필 수정 모달 표시 상태
const showProfileEditor = ref(false);
// 수정중인 프로필 데이터
const editedProfile = ref({
  name: '',
  field: '',
  height: null,
  mbti: ''
});

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

onUnmounted(() => {
  // 구독 취소 처리
  if (subscription) {
    subscription.unsubscribe();
  }
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
    
    // 채팅 메시지 로드
    await fetchChatMessages();
    
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

// 채팅 메시지를 데이터베이스에서 로드하고 Realtime 구독을 설정하는 함수
async function fetchChatMessages() {
  try {
    // 기존 구독 취소 (재연결 시)
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // 이전 메시지 로드
    const { data, error } = await supabase
      .from('dating_chat')
      .select('*')
      .eq('matching_id', matchData.value.id)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('메시지 로드 중 오류 발생:', error);
      throw error;
    }
    
    chatMessages.value = data || [];
    
    // 매칭 생성 시스템 메시지 추가
    if (chatMessages.value.length === 0) {
      // 매칭이 생성된 시스템 메시지 추가
      await addSystemMessage(`매칭이 성사되었습니다.`);
      
      // 미팅 일정이 있으면 시스템 메시지 추가
      if (matchData.value.meeting_date) {
        // 포맷팅 함수를 사용하여 요일까지 포함한 날짜 표시
        const formattedDate = formatMeetingDate(matchData.value.meeting_date);
        
        await addSystemMessage(`관리자가 미팅 일정을 ${formattedDate}로 설정했습니다.`);
      }
      
      // 미팅 장소가 있으면 시스템 메시지 추가
      if (matchData.value.meeting_place) {
        await addSystemMessage(`미팅 장소가 ${matchData.value.meeting_place}로 설정되었습니다.`);
      }
    }
    
    // Realtime 구독 설정
    setupRealtimeSubscription();
    
  } catch (err) {
    console.error('채팅 메시지 로드 중 오류 발생:', err);
    alert('채팅 메시지를 불러올 수 없습니다.');
  }
}

// Supabase Realtime 구독 설정
function setupRealtimeSubscription() {
  if (!matchData.value || !matchData.value.id) return;
  
  subscription = supabase
    .channel(`public:dating_chat:matching_id=eq.${matchData.value.id}`)
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'dating_chat',
        filter: `matching_id=eq.${matchData.value.id}`
      }, 
      (payload) => {
        // 새로운 메시지가 삽입되면 메시지 목록에 추가
        const newMessage = payload.new;
        if (newMessage && !chatMessages.value.some(msg => msg.id === newMessage.id)) {
          chatMessages.value.push(newMessage);
        }
      }
    )
    .subscribe((status) => {
      if (status !== 'SUBSCRIBED') {
        console.log('Realtime 구독 상태:', status);
      }
    });
}

// 새 채팅 메시지 저장 함수
async function addChatMessage(text, messageType = 'user') {
  try {
    const newMessage = {
      matching_id: matchData.value.id,
      sender_id: userUuid,
      message: text,
      message_type: messageType
    };
    
    const { data, error } = await supabase
      .from('dating_chat')
      .insert(newMessage)
      .select()
      .single();
      
    if (error) {
      console.error('메시지 저장 중 오류 발생:', error);
      throw error;
    }
    
    // 성공적으로 저장되면 배열에 추가
    if (data) {
      chatMessages.value.push(data);
    }
    
    return data;
  } catch (err) {
    console.error('채팅 메시지 저장 중 오류 발생:', err);
    alert('메시지를 저장할 수 없습니다. 다시 시도해주세요.');
    return null;
  }
}

// 시스템 메시지 추가 함수
async function addSystemMessage(text) {
  return await addChatMessage(text, 'system');
}

// 시스템 상태에 따른 상대방 정보 표시
function getPartnerDisplayName() {
  return partnerInfo.value && partnerInfo.value.name ? partnerInfo.value.name : '상대방';
}

// 일정 수락 함수
async function acceptSchedule() {
  if (!matchData.value || !matchData.value.meeting_date) {
    alert('수락할 일정이 없습니다.');
    return;
  }
  
  try {
    // 현재 사용자가 user1인지 user2인지 확인
    const isUser1 = matchData.value.user1_id === userUuid;
    
    // 매칭 데이터 업데이트
    const updateField = isUser1 ? { user1_accepted: true } : { user2_accepted: true };
    const { error } = await supabase
      .from('dating_matched')
      .update(updateField)
      .eq('id', matchData.value.id);
      
    if (error) throw error;
    
    // 현재 화면에 반영
    if (isUser1) {
      matchData.value.user1_accepted = true;
    } else {
      matchData.value.user2_accepted = true;
    }
    
    // 시스템 메시지 추가
    await addSystemMessage(`${currentUserInfo.value.name}님이 일정을 수락하셨습니다.`);
    
  } catch (err) {
    console.error('일정 수락 중 오류 발생:', err);
    alert('일정 수락을 처리할 수 없습니다. 다시 시도해주세요.');
  }
}

// 일정 취소 함수
async function cancelSchedule() {
  if (!matchData.value || !matchData.value.meeting_date) {
    alert('취소할 일정이 없습니다.');
    return;
  }
  
  try {
    // 현재 사용자가 user1인지 user2인지 확인
    const isUser1 = matchData.value.user1_id === userUuid;
    
    // 매칭 데이터 업데이트
    const updateField = isUser1 ? { user1_accepted: false } : { user2_accepted: false };
    const { error } = await supabase
      .from('dating_matched')
      .update(updateField)
      .eq('id', matchData.value.id);
      
    if (error) throw error;
    
    // 현재 화면에 반영
    if (isUser1) {
      matchData.value.user1_accepted = false;
    } else {
      matchData.value.user2_accepted = false;
    }
    
    // 시스템 메시지 추가
    await addSystemMessage(`${currentUserInfo.value.name}님이 일정 수락을 취소하셨습니다.`);
    
  } catch (err) {
    console.error('일정 취소 중 오류 발생:', err);
    alert('일정 취소를 처리할 수 없습니다. 다시 시도해주세요.');
  }
}

// 날짜 선택기 열기 함수
function openDatePicker() {
  // 현재 미팅 일정이 있는 경우 그 일정을 초기값으로 설정
  if (matchData.value && matchData.value.meeting_date) {
    selectedDateTime.value = new Date(matchData.value.meeting_date).getTime();
  } else {
    // 미팅 일정이 없으면 현재 날짜로 초기화
    selectedDateTime.value = new Date().getTime();
  }
  
  // 날짜 선택기 모달 열기
  showDatePicker.value = true;
}

// 일정 변경 요청 제출 함수
async function submitDateChange() {
  if (!selectedDateTime.value) {
    alert('날짜와 시간을 선택해주세요.');
    return;
  }
  
  // timestamptz 형식으로 처리하기 위해 날짜 객체 생성
  const dateObj = new Date(selectedDateTime.value);
  
  // 포맷팅된 날짜를 생성하여 사용
  const formattedDate = formatMeetingDate(dateObj);
  
  // 시스템 메시지 추가
  await addSystemMessage(`${currentUserInfo.value.name}님이 ${formattedDate}로 일정변경을 요청하셨습니다.`);
  
  // 모달 닫기
  showDatePicker.value = false;
  
  // 값 초기화
  selectedDateTime.value = null;
}

// 질문 보내기 함수
async function sendQuestion() {
  if (questionText.value.trim() === '') return;
  
  await addChatMessage(questionText.value);
  showQuestionModal.value = false;
  questionText.value = '';
}

// 프로필 수정 모달 열기
function openProfileEditor() {
  // 현재 유저 정보를 수정할 프로필 값으로 복사
  editedProfile.value = {
    name: currentUserInfo.value?.name || '',
    field: currentUserInfo.value?.field || '',
    height: currentUserInfo.value?.height || null,
    mbti: currentUserInfo.value?.mbti || ''
  };
  
  // 모달 열기
  showProfileEditor.value = true;
}

// 프로필 변경사항 저장
async function saveProfileChanges() {
  try {
    // Supabase에 프로필 업데이트
    const { data, error } = await supabase
      .from('dating')
      .update({
        name: editedProfile.value.name,
        field: editedProfile.value.field,
        height: editedProfile.value.height,
        mbti: editedProfile.value.mbti
      })
      .eq('id', userUuid)
      .select()
      .single();
    
    if (error) throw error;
    
    // 현재 프로필 정보 갱신
    currentUserInfo.value = data;
    
    // 변경 사항 알림 메시지 추가
    await addSystemMessage(`${currentUserInfo.value.name}\ub2d8\uc774 \uc790\uc2e0\uc758 \ud504\ub85c\ud544 \uc815\ubcf4\ub97c \uc5c5\ub370\uc774\ud2b8\ud558\uc600\uc2b5\ub2c8\ub2e4.`);
    
    // 모달 닫기
    showProfileEditor.value = false;
    
  } catch (err) {
    console.error('프로필 업데이트 오류:', err);
    alert('프로필 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// 출생년도 포맷팅 함수 - 다양한 형식 지원
function formatBirthYear(birthYear) {
  if (!birthYear) return '정보 없음';
  
  // 문자열로 변환
  const birthYearStr = String(birthYear);
  
  // YYYY-MM-DD 형식인 경우 첫 4자리만 추출
  if (birthYearStr.includes('-')) {
    const year = birthYearStr.split('-')[0];
    return year.slice(-2) + '년생';
  }
  
  // 숫자만 있는 경우
  return birthYearStr.slice(-2) + '년생';
}

// 미팅 일정 포맷팅 함수
function formatMeetingDate(dateString) {
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

// 시간 포맷팅 함수 - 메시지 작성 시간 표시
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  
  // 오늘 날짜인지 확인
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && 
                date.getMonth() === today.getMonth() && 
                date.getFullYear() === today.getFullYear();
  
  // 시간 포맷팅
  if (isToday) {
    // 오늘이면 시간만 표시: 오후 3:42
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes}`;
  } else {
    // 다른 날짜는 날짜와 시간 표시: 6월 5일 오후 3:42
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}월 ${day}일 ${hours < 12 ? '오전' : '오후'} ${hours % 12 || 12}:${minutes}`;
  }
}

</script>

<style scoped>
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

/* 매칭 정보 카드 스타일 */
.match-info-card {
  background-color: white;
  border-radius: 0;
  padding: 1rem;
  box-shadow: none;
  height: 100vh;
  overflow-y: auto;
}

.match-info-card h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

/* 프로필 섹션 스타일 */
.profiles-title {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #333;
}

.profiles-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* 프로필 카드 스타일 */
.profile-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.profile-header h4 {
  margin: 0;
  font-size: 0.95rem;
  color: #333;
}

.edit-button {
  background-color: transparent;
  border: none;
  color: #1976d2;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 3px 8px;
  border-radius: 4px;
}

.edit-button:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

.edit-icon {
  margin-right: 3px;
  font-size: 0.75rem;
}

.profile-content {
  display: flex;
  padding: 0.75rem;
}

.profile-avatar {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  margin-right: 1rem;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #eee;
}

.profile-details {
  flex: 1;
}

.profile-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 0.3rem;
}

.profile-info {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.2rem;
  line-height: 1.3;
}

/* 미팅 정보 스타일 */
.meeting-info {
  margin-bottom: 1.5rem;
  background-color: white;
  padding: 1rem;
  border-radius: 0;
  border-bottom: 1px solid #eee;
}

/* 미팅 액션 스타일 */
.meeting-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.meeting-actions .action-button {
  flex: 1;
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
.match-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: white;
  padding: 0;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0;
  padding: 1rem;
  box-shadow: none;
  margin-top: 0;
  overflow: hidden;
  border-top: 1px solid #eee;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: white;
  border-radius: 0;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

/* 시스템 메시지 스타일 */
.system-message {
  align-self: center;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
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
  font-size: 1rem;
  color: #333;
}

.message-time {
  display: block;
  font-size: 0.75rem;
  color: #888;
  margin-top: 3px;
  text-align: right;
}

/* 채팅 액션 버튼 스타일 */
.chat-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.accept-button {
  background-color: #4CAF50;
  color: white;
  flex: 1;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  flex: 1;
}

.change-date-container {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  flex: 2;
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
  padding: 1.5rem;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
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

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #555;
}

.form-group input, 
.form-group select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
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
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.modal-actions .cancel-button {
  background-color: #f5f5f5;
  color: #333;
}

.modal-actions .send-button {
  background-color: #1976d2;
  color: white;
}

/* 반응형 스타일 */
@media (min-width: 768px) {
  .profiles-container {
    flex-direction: row;
  }
  
  .profile-card {
    flex: 1;
  }
}

.question-textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
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
