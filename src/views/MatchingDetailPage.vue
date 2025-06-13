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
        <!-- 1. 만남 일정 카드 (맨 위에 배치) -->
        <div class="profile-card meeting-card no-padding">
          <div class="meeting-content no-padding">
            <div class="profile-details no-margin">
              <div class="meeting-info-row">
                <span class="meeting-info-value">📅 {{ matchData.meeting_date ? formatMeetingDate(matchData.meeting_date) : '아직 정해지지 않았습니다' }}</span>
              </div>
              <div class="meeting-info-row">
                <span class="meeting-info-value">📍 {{ matchData.meeting_place || '아직 정해지지 않았습니다' }}</span>
              </div>
            </div>
          </div>
          
          <div class="meeting-actions">
            <div class="meeting-actions-row">
              <!-- 현재 사용자가 수락했는지 확인 -->
              <button 
                v-if="matchData.user1_id === userUuid ? matchData.user1_accepted : matchData.user2_accepted"
                class="card-action-btn cancel-button half-width" 
                @click="cancelSchedule">
                일정 수락 취소
              </button>
              <button 
                v-else 
                class="card-action-btn accept-button half-width" 
                @click="acceptSchedule">
                일정 수락
              </button>
              
              <button class="card-action-btn change-button half-width" @click="openDatePicker">
                일정 변경
              </button>
            </div>
          </div>
        </div>
        
        <!-- 2. 채팅 컨테이너 (가운데 배치 ) -->
        <div class="chat-container">
          <div class="chat-messages" ref="chatContainer">
            <!-- 시스템 메시지 -->
            <div v-for="(message, index) in chatMessages" :key="message.id" class="message-container">
              <!-- 시스템 메시지 -->
              <div v-if="message.message_type === 'system'" class="system-message">
                <p>{{ message.message }}</p>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
                <!-- 일정 변경 요청에 대한 수락 버튼 (요청을 받은 사람만 볼 수 있음) -->
                <div v-if="isDateChangeRequest(message) && message.sender_id !== userUuid && !message.answered" class="date-change-actions">
                  <button @click="acceptDateChange(message)" class="accept-button">일정 수락하기</button>
                </div>
              </div>
              
              <!-- 질문카드 메시지 -->
              <div v-else-if="message.message_type === 'question_card'" class="question-card-message">
                <div class="question-card-header">
                  {{ getQuestionCardHeader(message) }}
                </div>
                <div class="card-content">
                  <p>{{ message.message }}</p>
                  <span class="message-time">{{ formatTime(message.created_at) }}</span>
                </div>
                <!-- 답변 버튼은 질문 받은 사람만 볼 수 있음 -->
                <div v-if="message.sender_id !== userUuid && !message.answered" class="answer-actions">
                  <input 
                    v-model="message.answerText" 
                    class="answer-input" 
                    placeholder="10자 이내로 답변" 
                    maxlength="10" />
                  <button 
                    @click="submitAnswer(message)" 
                    class="answer-button"
                    :disabled="!message.answerText || message.answerText.length > 10">
                    답변하기
                  </button>
                </div>
                <!-- 답변이 있으면 표시 -->
                <div v-if="message.answer" class="answer-display">
                  <span class="answer-label">답변:</span> {{ message.answer }}
                </div>
              </div>
              
              <!-- 일반 메시지 -->
              <div 
                v-else 
                :class="[message.sender_id === userUuid ? 'user-message' : 'partner-message']"
                class="action-message"
              >
                <p>{{ message.message }}</p>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 3. 프로필 카드 (맨 아래에 배치) -->
        <div class="profiles-container">
          <!-- 상대방 정보 -->
          <div class="profile-card partner-card">
            <div class="profile-header">
              <h4>상대방 정보</h4>
            </div>
            <div class="profile-content">
              <div class="profile-details">
                <div class="profile-name">{{ partnerInfo.name }}</div>
                <div class="profile-info">{{ formatBirthYear(partnerInfo.birth_year) }}</div>
                <div class="profile-info">{{ partnerInfo.field || '정보 없음' }}</div>
                <div class="profile-info">📍 {{ partnerInfo.location || '정보 없음' }}</div>
                <div class="profile-info">키: {{ partnerInfo.height || '정보 없음' }}cm</div>
                <div class="profile-info">MBTI: {{ partnerInfo.mbti || '정보 없음' }}</div>
              </div>
            </div>
            <button class="card-action-btn question-card-btn" @click="showQuestionCardModal = true">
              <span class="question-icon">❓</span> 질문카드 보내기
            </button>
          </div>
          
          <!-- 내 정보 -->
          <div class="profile-card my-card">
            <div class="profile-header">
              <h4>내 정보</h4>
            </div>
            <div class="profile-content">
              <div class="profile-details">
                <div class="profile-name">{{ currentUserInfo.name }}</div>
                <div class="profile-info">{{ formatBirthYear(currentUserInfo.birth_year) }}</div>
                <div class="profile-info">{{ currentUserInfo.field || '정보 없음' }}</div>
                <div class="profile-info">📍 {{ currentUserInfo.location || '정보 없음' }}</div>
                <div class="profile-info">키: {{ currentUserInfo.height || '정보 없음' }}cm</div> 
                <div class="profile-info">MBTI: {{ currentUserInfo.mbti || '정보 없음' }}</div>
              </div>
            </div>
            <button class="card-action-btn edit-button" @click="openProfileEditor">
              <span class="edit-icon">✍️</span> 내 정보 수정하기
            </button>
          </div>
        </div>
      </div>
      
      <!-- 질문 모달 -->
      <div v-if="showQuestionModal" class="modal">
        <div class="modal-content">
          <h3>질문하기</h3>
          <textarea
            v-model="questionText"
            class="question-textarea"
            rows="4"
            placeholder="상대방에게 궁금한 점을 물어보세요..."
          ></textarea>
          <div class="modal-actions">
            <button @click="showQuestionModal = false" class="cancel-button">취소</button>
            <button @click="sendQuestion" class="send-button">보내기</button>
          </div>
        </div>
      </div>
      
      <!-- 질문카드 모달 -->
      <div v-if="showQuestionCardModal" class="modal">
        <div class="modal-content">
          <h3>질문카드 보내기</h3>
          <p class="character-counter">
            남은 글자 수: <strong>{{ remainingCharacters }}</strong>/50<br>
            <span v-if="!canSendQuestionToday()" class="daily-limit-warning">❗ 오늘은 질문을 이미 보냈습니다</span>
          </p>
          
          <div class="question-card-info">
            <ul>
              <li>질문카드에 적힌 답변한 글자수가 차감됩니다.</li>
              <li>하루(24시간)에 각 1번만 질문을 보낼 수 있습니다.</li>
              <li>정해진 글자 수로 상대방을 최대한 알아보는 게임이에요.</li>
              <li>긴 이야기는 서로 만나서 재밌게 이야기해봐요.</li>
            </ul>
          </div>
          <div class="question-cards-container">
            <div 
              v-for="(question, index) in predefinedQuestions" 
              :key="index"
              class="question-card"
              @click="sendQuestionCard(question)">
              {{ question }}
            </div>
          </div>
          <div class="modal-actions">
            <button @click="showQuestionCardModal = false" class="cancel-button">닫기</button>
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
import { useRoute, useRouter } from 'vue-router';
import supabase from '../supabase';

const route = useRoute();
const router = useRouter();
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

// 질문카드 관련 변수
const showQuestionCardModal = ref(false);

// 모든 가능한 질문 목록
const allPredefinedQuestions = [
  "교회를 다니게 된 계기 알고 싶어요.",
  "가장 좋아하는 찬양곡이나 CCM은 뭐예요?",
  "기도 제목 중에서 제일 기억에 남는 건 뭐였나요?",
  "요즘 빠져 있는 취미나 관심사가 있다면요?",
  "스트레스 받을 때 나만의 해소법은 뭐예요?",
  "아침형 인간이에요, 저녁형 인간이에요?",
  "MBTI 믿는 편인가요? 맞는 것 같나요?",
  "같이 요리해보고 싶은 음식이 있다면?",
  "카페에서 가장 자주 시키는 메뉴는?",
  "다이어리 쓰는 스타일인가요, 그냥 머릿속에 정리하는 스타일인가요?",
  "제일 좋아하는 음식은?",
  "제일 좋았던 여행지?",
  "최근에 재밌게 본 영화나 책은?",
  "요즘 나를 가장 웃게 만드는 일은 뭔가요?",
  "성경 속에 살 수 있다면 어느 시대에서 살아보고 싶어요?",
  "가장 좋아하는 성경의 말씀은 뭐예요?",
  "라면 끓일 때 넣는 '비밀 레시피'가 있다면?",
  "모든 음식이 사라지고 단 하나만 남을 수 있다면, 그것은?",
  "하루 동안 동물로 살아야 한다면 어떤 동물을 골라요? "
];

// 날짜에 기반한 랜덤한 질문 목록 생성 함수
function getRandomQuestionsBasedOnDate(allQuestions, count = 6) {
  // 오늘 날짜를 YYYYMMDD 형식으로 가져와서 시드로 사용
  const today = new Date();
  const dateString = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  
  // 날짜 문자열을 숫자 시드로 변환
  let seed = 0;
  for (let i = 0; i < dateString.length; i++) {
    seed = ((seed * 31) + dateString.charCodeAt(i)) % 2147483647;
  }
  
  // 시드 기반의 의사 난수 생성 함수
  function seededRandom() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }
  
  // 원본 배열을 복사하여 수정하지 않도록 함
  const questionsCopy = [...allQuestions];
  
  // Fisher-Yates 셔플 알고리즘으로 시드 기반 랜덤하게 섞기
  for (let i = questionsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
  }
  
  // 섞인 배열에서 처음 'count'개의 질문 반환
  return questionsCopy.slice(0, count);
}

// 일일 랜덤 질문 6개 선택하여 사용
const predefinedQuestions = getRandomQuestionsBasedOnDate(allPredefinedQuestions, 6);
const remainingCharacters = ref(50); // 기본 50자 제한
const answerText = ref('');
const selectedQuestionId = ref(null);

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
    
    // 남은 질문 글자수 설정
    remainingCharacters.value = matchingData.message_ticket || 50;
    
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
    // if (chatMessages.value.length === 0) {
    //   // 매칭이 생성된 시스템 메시지 추가
    //   await addSystemMessage(`매칭이 성사되었습니다.`);
      
    //   // 미팅 일정이 있으면 시스템 메시지 추가
    //   if (matchData.value.meeting_date) {
    //     // 포맷팅 함수를 사용하여 요일까지 포함한 날짜 표시
    //     const formattedDate = formatMeetingDate(matchData.value.meeting_date);
        
    //     await addSystemMessage(`관리자가 미팅 일정을 ${formattedDate}로 설정했습니다.`);
    //   }
      
    //   // 미팅 장소가 있으면 시스템 메시지 추가
    //   if (matchData.value.meeting_place) {
    //     await addSystemMessage(`미팅 장소가 ${matchData.value.meeting_place}로 설정되었습니다.`);
    //   }
    // }
    
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
    // INSERT 이벤트 구독 (새 메시지)
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
    // UPDATE 이벤트 구독 (답변 업데이트 등)
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'dating_chat',
        filter: `matching_id=eq.${matchData.value.id}`
      },
      (payload) => {
        // 메시지가 업데이트되면 해당 메시지 찾아서 업데이트
        const updatedMessage = payload.new;
        const messageIndex = chatMessages.value.findIndex(msg => msg.id === updatedMessage.id);
        
        if (messageIndex !== -1) {
          // 기존 메시지를 업데이트된 메시지로 교체
          chatMessages.value[messageIndex] = updatedMessage;
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

// 일정 변경 요청 메시지인지 확인하는 함수
function isDateChangeRequest(message) {
  return message.message_type === 'system' && 
         message.requested_time && 
         message.message.includes('일정변경을 요청');
}

// 일정 변경 요청 수락 함수
async function acceptDateChange(message) {
  try {
    if (!message.requested_time) {
      alert('날짜 정보가 없습니다. 다시 시도해주세요.');
      return;
    }
    
    // requested_time을 사용하여 meeting_date 업데이트
    const { error: updateError } = await supabase
      .from('dating_matched')
      .update({ meeting_date: message.requested_time })
      .eq('id', matchData.value.id);
      
    if (updateError) {
      console.error('일정 수락 중 오류 발생:', updateError);
      throw updateError;
    }
    
    // 메시지를 수락됨으로 표시 (dating_chat 테이블에 answered 필드 업데이트)
    const { error: messageUpdateError } = await supabase
      .from('dating_chat')
      .update({ answered: true })
      .eq('id', message.id);
      
    if (messageUpdateError) {
      console.error('메시지 업데이트 중 오류 발생:', messageUpdateError);
      throw messageUpdateError;
    }
    
    // 현재 화면에서 보이는 데이터도 업데이트
    message.answered = true;
    
    // 일정 수락 시스템 메시지 추가
    await addSystemMessage(`${currentUserInfo.value.name}님이 일정 변경 요청을 수락하셨습니다.`);
    
    // 매칭 데이터 다시 로드하여 일정 카드 업데이트
    //await fetchMatchingDetails();
    
    // 성공 메시지
    alert('일정 변경이 수락되었습니다.');
  } catch (err) {
    console.error('일정 수락 중 오류 발생:', err);
alert('일정 수락을 처리할 수 없습니다. 다시 시도해주세요.');
  }
}

// 시스템 상태에 따른 상대방 정보 표시
function getPartnerDisplayName() {
  return partnerInfo.value && partnerInfo.value.name ? partnerInfo.value.name : '상대방';
}

// 현재 사용자의 이름 가져오기
function getCurrentUserDisplayName() {
  return currentUserInfo.value && currentUserInfo.value.name ? currentUserInfo.value.name : '나';
}

// 질문카드 헤더 가져오기 (누가 누구에게 질문했는지)
function getQuestionCardHeader(message) {
  // 질문을 보낸 사람이 나인지 확인
  const isMyQuestion = message.sender_id === userUuid;
  
  if (isMyQuestion) {
    return `${getCurrentUserDisplayName()}님이 → ${getPartnerDisplayName()}님에게 질문.`;
  } else {
    return `${getPartnerDisplayName()}님이 → ${getCurrentUserDisplayName()}님에게 질문.`;
  }
}

// 현재 유저가 상대방인지 여부 확인 (답변 버튼 표시 용도)
const isPartner = computed(() => {
  if (!matchData.value || !userUuid) return false;
  return matchData.value.user1_id === userUuid ? false : true;
});

// 사용자가 오늘 질문을 보낼 수 있는지 확인
function canSendQuestionToday() {
  if (!matchData.value) return false;
  
  const isUserOne = matchData.value.user1_id === userUuid;
  const lastQuestionedDate = isUserOne ? 
    matchData.value.user1_questioned :
    matchData.value.user2_questioned;
  
  // 질문 기록이 없는 경우 가능
  if (!lastQuestionedDate) return true;
  
  // 질문 기록이 오늘인지 확인
  const lastDate = new Date(lastQuestionedDate);
  const today = new Date();
  
  return lastDate.getDate() !== today.getDate() || 
         lastDate.getMonth() !== today.getMonth() || 
         lastDate.getFullYear() !== today.getFullYear();
}

// 질문 타임스태프 업데이트
async function updateQuestionTimestamp() {
  if (!matchData.value) return;
  
  const isUserOne = matchData.value.user1_id === userUuid;
  const now = new Date().toISOString();
  
  const updateData = isUserOne ? 
    { user1_questioned: now } :
    { user2_questioned: now };
  
  try {
    // 매칭 테이블 업데이트
    const { error } = await supabase
      .from('dating_matched')
      .update(updateData)
      .eq('id', matchData.value.id);
      
    if (error) throw error;
    
    // 로컬 값도 업데이트
    if (isUserOne) {
      matchData.value.user1_questioned = now;
    } else {
      matchData.value.user2_questioned = now;
    }
    
  } catch (err) {
    console.error('질문 타임스태프 업데이트 중 오류:', err);
  }
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
  
  try {
    // 일정 변경 요청 메시지 추가 (requested_time 포함)
    const newMessage = {
      matching_id: matchData.value.id,
      sender_id: userUuid,
      message: `${currentUserInfo.value.name}님이 ${formattedDate}로 일정변경을 요청하셨습니다.`,
      message_type: 'system',
      requested_time: dateObj.toISOString() // timestamptz 형식으로 저장
    };
    
    const { data, error } = await supabase
      .from('dating_chat')
      .insert(newMessage)
      .select()
      .single();
      
    if (error) {
      console.error('일정 변경 요청 저장 중 오류 발생:', error);
      throw error;
    }
    
    // 성공적으로 저장되면 채팅 메시지 배열에 추가
    if (data) {
      chatMessages.value.push(data);
    }
    
    // 모달 닫기
    showDatePicker.value = false;
    
    // 값 초기화
    selectedDateTime.value = null;
  } catch (err) {
    console.error('일정 변경 요청 중 오류 발생:', err);
    //alert('일정 변경 요청을 처리할 수 없습니다. 다시 시도해주세요.');
  }
}

// 질문 보내기 함수
async function sendQuestion() {
  if (questionText.value.trim() === '') return;
  
  await addChatMessage(questionText.value);
  showQuestionModal.value = false;
  questionText.value = '';
}

// 질문카드 보내기 함수
async function sendQuestionCard(question) {
  try {
    if (remainingCharacters.value <= 0) {
      alert('질문 글자수가 모두 소진되었습니다.');
      return;
    }
    
    // 일일 질문 제한 확인
    if (!canSendQuestionToday()) {
      alert('오늘 이미 질문을 보냈습니다. 내일 다시 시도해주세요.');
      return;
    }
    
    // 질문카드 메시지 타입으로 저장
    const newMessage = {
      matching_id: matchData.value.id,
      sender_id: userUuid,
      message: question,
      message_type: 'question_card'
    };
    
    const { data, error } = await supabase
      .from('dating_chat')
      .insert(newMessage)
      .select()
      .single();
      
    if (error) {
      console.error('질문카드 저장 중 오류 발생:', error);
      throw error;
    }
    
    // 마지막 질문 시간 업데이트
    await updateQuestionTimestamp();
    
    // 성공적으로 저장되면 배열에 추가
    if (data) {
      // 대화창에 표시될 때 추가 속성 설정
      data.answerText = '';
      data.answered = false;
      chatMessages.value.push(data);
      
      // 모달 닫기
      showQuestionCardModal.value = false;
    }
  } catch (err) {
    console.error('질문카드 보내기 중 오류 발생:', err);
    alert('질문카드를 보낼 수 없습니다. 다시 시도해주세요.');
  }
}

// 질문카드 답변 제출 함수
async function submitAnswer(message) {
  if (!message.answerText || message.answerText.trim() === '') return;
  if (message.answerText.length > 10) {
    alert('답변은 10자 이내로 입력해주세요.');
    return;
  }
  
  try {
    // 사용한 글자수 계산 및 남은 글자수 업데이트
    const usedCharacters = message.answerText.length;
    const newRemainingChars = remainingCharacters.value - usedCharacters;
    
    if (newRemainingChars < 0) {
      alert(`글자수가 부족합니다. 현재 남은 글자수: ${remainingCharacters.value}`);
      return;
    }
    
    // 채팅 메시지 업데이트 (answer 필드 추가)
    const { data: updateData, error: updateError } = await supabase
      .from('dating_chat')
      .update({
        answer: message.answerText,
        answered: true
      })
      .eq('id', message.id)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    // 매칭 테이블의 남은 글자수 업데이트
    const { error: matchUpdateError } = await supabase
      .from('dating_matched')
      .update({
        message_ticket: newRemainingChars
      })
      .eq('id', matchData.value.id);
      
    if (matchUpdateError) throw matchUpdateError;
    
    // 상태 업데이트
    message.answer = message.answerText;
    message.answered = true;
    message.answerText = '';
    remainingCharacters.value = newRemainingChars;
    
    // 시스템 메시지로 알림
    await addSystemMessage(`${currentUserInfo.value.name}님이 질문에 답변했습니다.`);
    
  } catch (err) {
    console.error('답변 저장 중 오류 발생:', err);
    alert('답변을 저장할 수 없습니다. 다시 시도해주세요.');
  }
}

// 프로필 수정 페이지로 이동
function openProfileEditor() {
  // 유저 ID를 가지고 프로필 페이지로 이동
  router.push(`/profile/${userUuid}`);
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
  flex-direction: row;
  gap: 0.5rem;
  margin-top: 0.25rem;
  margin-bottom: 0;
  width: 100%;
  align-items: stretch;
}

/* Keep horizontal layout on all devices */

/* 프로필 카드 스타일 */
.profile-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
  min-width: 0; /* Prevent flex items from overflowing */
  overflow: hidden;
  background-color: white;
  display: flex;
  flex-direction: column;
}

.profile-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
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
}

.profile-content {
  display: flex;
  padding: 0.75rem;
  flex: 1;
}

.profile-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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
.meeting-card {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  flex: 0 0 auto; /* Prevent this specific card type from growing as a flex item */
}

.meeting-content {
  padding: 0.75rem;
}

.no-padding {
  padding: 0 !important;
}

.no-margin {
  margin: 0 !important;
}

.meeting-info-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.5rem;
  width: 100%;
}

.meeting-info-label {
  font-weight: bold;
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 0.3rem;
}

.meeting-info-value {
  font-size: 1rem;
  color: #333;
}

/* 미팅 액션 스타일 */
.meeting-actions {
  width: 100%;
}

.meeting-actions-row {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.half-width {
  flex: 1;
}

.accept-button {
  background-color: #4CAF50;
}

.cancel-button {
  background-color: #f44336;
}

.change-button {
  background-color: #3498db;
}

.meeting-actions .card-action-btn {
  margin-top: 0;
  border-radius: 0;
}

.meeting-actions .half-width:first-child {
  border-radius: 0 0 0 12px;
}

.meeting-actions .half-width:last-child {
  border-radius: 0 0 12px 0;
}

.meeting-actions .action-button {
  flex: 1;
}

/* 채팅 컨테이너 스타일 */
.match-detail-container {
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
  padding: 0;
  border-top: 1px solid #eee;
  height: 100vh; /* 전체 뷰포트 높이로 설정 */
  overflow: hidden; /* 전체 컨테이너는 스크롤 없음 */
}

.match-info-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 0.5rem;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 8px;
  margin: 0.25rem 0;
  overflow: hidden;
  border: 1px solid #eee;
}

.chat-messages {
  flex: 1;
  overflow-y: auto; /* 채팅 메세지만 스크롤되도록 설정 */
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
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

.date-change-actions {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
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

/* 질문카드 스타일 */
.card-action-btn {
  font-size: 1rem;
  color: white;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: auto;
  width: 100%;
  border-radius: 0 0 12px 12px;
  transition: background-color 0.2s;
}

.question-card-btn {
  background-color: #3498db;
}

.edit-button {
  background-color: #4CAF50;
}

.question-icon {
  margin-right: 4px;
}

.question-cards-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.question-card {
  padding: 0.75rem 1rem;
  background-color: #f0f7ff;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.question-card:hover {
  background-color: #d0e5ff;
}

.character-counter {
  text-align: center;
  color: #555;
  margin-bottom: 0.5rem;
}

.character-counter strong {
  color: #007bff;
}

.daily-limit-warning {
  font-size: 0.85rem;
  color: #dc3545;
  display: block;
  margin-top: 0.3rem;
}

.question-card-info {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin: 0.5rem 0 1rem;
  border-left: 3px solid #6c757d;
}

.question-card-info ul {
  margin: 0;
  padding-left: 1.25rem;
}

.question-card-info li {
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  color: #495057;
}

.question-card-info li:last-child {
  margin-bottom: 0;
}

/* 질문카드 채팅 메시지 스타일 */
.question-card-message {
  align-self: center;
  width: 90%;
  padding: 0.75rem 1rem;
  background-color: #f0f7ff;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.question-card-header {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6c757d;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
  margin-bottom: 0.75rem;
  text-align: center;
}

.card-content p {
  font-weight: 500;
  color: #333;
  margin: 0 0 0.3rem;
}

.answer-actions {
  display: flex;
  margin-top: 0.75rem;
  gap: 0.5rem;
}

.answer-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
}

.answer-button {
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;
}

.answer-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.answer-display {
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed #ccc;
  font-size: 0.95rem;
}

.answer-label {
  font-weight: 600;
  color: #28a745;
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
