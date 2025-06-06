<template>
  <div class="matching-algorithm">
    <div class="main-user-selection">
      <h3>매칭 대상자 선택</h3>
      <div class="selection-wrapper">
        <select 
          v-model="selectedMainUser" 
          class="user-select" 
          @change="loadMainUserDetails"
          :disabled="loading">
          <option value="" disabled>주 사용자를 선택하세요</option>
          <option v-for="user in userList" :key="user.id" :value="user.id">
            {{ user.name }} ({{ user.gender === '남자' ? '남성' : '여성' }})
          </option>
        </select>
      </div>
      
      <div class="user-profile-card main-user" v-if="mainUser">
        <div class="profile-header">
          <h3>{{ mainUser.name }} 님의 프로필</h3>
          <button @click="requestRecommendation" class="recommendation-button" :disabled="recommendationLoading">
            <span v-if="!recommendationLoading">추천알고리즘</span>
            <span v-else>추천 중...</span>
          </button>
        </div>
        <div class="profile-details">
          <p><strong>나이:</strong> {{ calculateAge(mainUser.birth_year) }}세</p>
          <p><strong>성별:</strong> {{ mainUser.gender === '남자' ? '남성' : '여성' }}</p>
          <p><strong>직업:</strong> {{ mainUser.field }}</p>
          <p><strong>회사:</strong> {{ mainUser.company_name || '정보 없음' }}</p>
          <p><strong>지역:</strong> {{ mainUser.location || '정보 없음' }}</p>
          <p><strong>교회:</strong> {{ mainUser.church_name || '정보 없음' }}</p>
          <p><strong>취미:</strong> {{ mainUser.hobby || '정보 없음' }}</p>
          <p><strong>MBTI:</strong> {{ mainUser.mbti || '정보 없음' }}</p>
          <p><strong>학력:</strong> {{ mainUser.education || '정보 없음' }}</p>
          <p><strong>이상형 우선순위:</strong> {{ formatPriorities(mainUser.ideal_type_priorities) }}</p>
        </div>
      </div>
    </div>

    <div class="recommended-matches" v-if="mainUser && topRecommendations.length">
      <h3>AI 추천 매칭 (TOP 3)</h3>
      <div class="recommended-list">
        <div v-for="(recommendation, index) in topRecommendations" :key="index" class="recommendation-card">
          <div class="recommendation-header">
            <h4>{{ recommendation.name }}</h4>
            <div class="recommendation-rank">{{ index + 1 }}위</div>
          </div>
          <div class="recommendation-details">
            <div class="user-info">
              <p>{{ calculateAge(recommendation.birth_year) }}세, {{ recommendation.gender === '남자' ? '남성' : '여성' }}</p>
              <p>{{ recommendation.field }} {{ recommendation.company_name ? `at ${recommendation.company_name}` : '' }}</p>
              <p>{{ recommendation.location || '지역 정보 없음' }}</p>
              <p>{{ recommendation.mbti || 'MBTI 정보 없음' }}</p>
            </div>
            <div class="recommendation-reason">
              <h5>추천 이유</h5>
              <div v-for="(point, i) in recommendation.reason.split('•').filter(p => p.trim())" :key="i" class="reason-point">
                <p>• {{ point.trim() }}</p>
              </div>
            </div>
            <div class="button-group">
              <button @click="selectMatch(recommendation)" class="select-button">선택하기</button>
              <button @click="matchUsers(mainUser, recommendation)" class="match-button">매칭하기</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="no-matches" v-else-if="mainUser">
      <p>매칭 가능한 사용자가 없습니다.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import supabase from '../supabase';
import axios from 'axios';

// Props
const props = defineProps({
  userList: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['match-selected', 'create-match']);

// State variables
const selectedMainUser = ref('');
const mainUser = ref(null);
const potentialMatches = ref([]);
const aiLoading = ref(false);
const aiError = ref('');
const aiAnalysisResults = ref({});
const recommendationLoading = ref(false);
const topRecommendations = ref([]);

// Watch for main user selection
watch(selectedMainUser, async (newValue) => {
  if (newValue) {
    await loadMainUserDetails();
  } else {
    mainUser.value = null;
    potentialMatches.value = [];
  }
});

// Calculate age from birth year
function calculateAge(birthYearData) {
  if (!birthYearData) return '정보 없음';
  
  const currentYear = new Date().getFullYear();
  
  // Handle different date formats
  if (typeof birthYearData === 'number') {
    // If it's already a number, just use it directly
    return currentYear - birthYearData;
  } else if (typeof birthYearData === 'string') {
    // Check if it's a full date format (YYYY-MM-DD)
    if (birthYearData.includes('-')) {
      // Extract just the year from the date string
      const year = parseInt(birthYearData.split('-')[0], 10);
      return !isNaN(year) ? currentYear - year : '정보 없음';
    } else {
      // Just a year as string
      const year = parseInt(birthYearData, 10);
      return !isNaN(year) ? currentYear - year : '정보 없음';
    }
  }
  
  return '정보 없음';
}

// Format user information as a string for AI analysis
function formatUserInfoString(user) {
  if (!user) return '';
  
  return `
이름: ${user.name}
나이: ${calculateAge(user.birth_year)}세
성별: ${user.gender}
직업: ${user.field || '정보 없음'}
회사: ${user.company_name || '정보 없음'}
지역: ${user.location || '정보 없음'}
교회: ${user.church_name || '정보 없음'}
취미: ${user.hobby || '정보 없음'}
MBTI: ${user.mbti || '정보 없음'}
학력: ${user.education || '정보 없음'}
이상형 우선순위: ${formatPriorities(user.ideal_type_priorities) || '정보 없음'}
`;
}

// Format priorities for display
function formatPriorities(priorities) {
  if (!priorities || !Array.isArray(priorities)) return '정보 없음';
  const priorityLabels = ['성격', '외모', '능력', '신앙', '가치관'];
  
  // 각 우선순위 항목과 값을 매핑하여 결합
  return priorities.map((priority, index) => {
    const label = priorityLabels[index] || `항목${index+1}`;
    return `${label}: ${priority}`;
  }).join(', ');
}

// Load main user details
async function loadMainUserDetails() {
  if (!selectedMainUser.value) return;
  
  try {
    // Find the user in the list
    const user = props.userList.find(u => u.id === selectedMainUser.value);
    if (user) {
      mainUser.value = user;
      // Find potential matches of the opposite gender
      findPotentialMatches();
      // Reset any existing AI analysis results when changing the main user
      aiAnalysisResults.value = {};
    }
  } catch (err) {
    console.error('Error loading main user details:', err);
  }
}

// Find potential matches
function findPotentialMatches() {
  if (!mainUser.value) return;

  potentialMatches.value = [];
  const currentUser = mainUser.value;
  
  // 1. 현재 유저와 다른 성별의 사용자만 필터링
  const candidates = props.userList.filter(user => {
    return user.id !== currentUser.id && user.gender !== currentUser.gender;
  });
  
  // 2. 각 후보에 대한 매칭 정보 계산
  for (const user of candidates) {
    // 나이 차이 계산
    const age1 = calculateAge(currentUser.birth_year);
    const age2 = calculateAge(user.birth_year);
    const ageDiff = Math.abs(age1 - age2);
    
    // 사용자 정보 문자열 생성
    const mainUserInfo = formatUserInfoString(currentUser);
    const matchUserInfo = formatUserInfoString(user);
    
    // 매칭 객체 생성
    potentialMatches.value.push({
      user,
      mainUserInfo,
      matchUserInfo,
      ageDiff,
      aiAnalysis: null,
      aiLoading: false,
      aiError: ''
    });
  }
  
  // 나이 차이 기준으로 정렬
  sortByAgeDiff();
}

// 나이 차이 순으로 정렬
function sortByAgeDiff() {
  potentialMatches.value = [...potentialMatches.value].sort((a, b) => {
    return a.ageDiff - b.ageDiff;
  });
}

// 이름순으로 정렬
function sortByName() {
  potentialMatches.value = [...potentialMatches.value].sort((a, b) => {
    return a.user.name.localeCompare(b.user.name);
  });
}

// Computed property for sorted matches
const sortedMatches = computed(() => {
  if (!potentialMatches.value.length) return [];
  return potentialMatches.value;
});

// Select a match to view details
function selectMatch(user) {
  emit('match-selected', {
    mainUser: mainUser.value,
    matchUser: user
  });
}

// Match two users together
async function matchUsers(user1, user2) {
  try {
    if (!user1 || !user2) {
      alert('매칭할 유저 정보가 없습니다.');
      return;
    }
    
    // 이미 매칭되었는지 확인하는 과정과 데이터베이스에 저장하는 작업은 부모 컴포넌트에서 처리합니다
    emit('create-match', {
      user1Id: user1.id,
      user2Id: user2.id
    });
  } catch (error) {
    console.error('매칭 작업 중 오류 발생:', error);
    alert(`매칭 작업 중 오류가 발생했습니다: ${error.message}`);
  }
}

// Request AI analysis for a match
async function requestAiAnalysis(match) {
  if (match.aiLoading) return;
  
  match.aiLoading = true;
  match.aiError = '';
  
  try {
    console.log('AI 분석 요청 시작:', match.user.name);
    const analysis = await getAiAnalysis(match);
    match.aiAnalysis = analysis;
    aiAnalysisResults.value[match.user.id] = analysis;
    console.log('AI 분석 완료:', match.user.name);
  } catch (error) {
    console.error('AI 매칭 분석 오류:', error);
    match.aiError = `AI 분석 중 오류가 발생했습니다: ${error.message}`;
  } finally {
    match.aiLoading = false;
  }
}

// Perform AI analysis with external API
// Request AI-powered recommendations for the current user
async function requestRecommendation() {
  if (recommendationLoading.value || !mainUser.value) return;
  
  try {
    recommendationLoading.value = true;
    topRecommendations.value = [];
    
    const currentUser = mainUser.value;
    console.log('AI 추천 알고리즘 시작:', currentUser.name);
    
    // 1. 현재 유저와 다른 성별의 사용자만 필터링
    const oppositeGenderUsers = props.userList.filter(user => {
      return user.id !== currentUser.id && user.gender !== currentUser.gender;
    });
    
    if (oppositeGenderUsers.length === 0) {
      console.log('추천 가능한 대상이 없습니다.');
      return;
    }
    
    // 환경 변수 디버깅
    console.log('환경 변수 확인:', import.meta.env);
    // 환경 변수를 직접 참조하거나 vite.config.js에서 정의한 변수 사용
    const apiKey = import.meta.env.VITE_POE_API_KEY || import.meta.env.POE_API_KEY || 'oqblhi8pIB7QFd1aNeRYHh7xQfdEHGW9yu3G6EHLiQE';
    console.log('API 키:', apiKey);
    if (!apiKey) throw new Error('API 키를 찾을 수 없습니다. 환경 변수를 확인하세요.');
    
    // 2. Format the data for the API call
    const selectedUser = formatUserInfoString(currentUser);
    
    // Format all potential match users together
    let allCandidates = '\n=== 가능한 매칭 대상자 목록 ===\n';
    oppositeGenderUsers.forEach((user, index) => {
      allCandidates += `\n===== 후보 ${index + 1} =====\n`;
      allCandidates += formatUserInfoString(user);
      allCandidates += `사용자ID: ${user.id}\n`;
    });
    
    // 3. Prepare the prompt and make the API call
    const prompt = `
기독교 데이팅 서비스에서 특정 사용자에게 가장 적합한 매칭 대상자 TOP 3를 추천해주세요.

### 선택한 사용자 정보:
${selectedUser}

### 가능한 매칭 대상자 후보 목록:
${allCandidates}

## 요청사항:
1. 선택한 사용자와 가장 잘 어울릴 것 같은 TOP 3 매칭 대상자를 선택해주세요.
2. 각 추천 대상자에 대해 왜 이 사용자를 추천하는지 이유를 3-4개로 앞에 •를 붙여서 정리해서 설명해주세요.
- 선택한 사용자 정보와 후보간의 MBTI에서 가장 중요한 건, S,N가 동일한지를 볼 것, 그 다음으로 T,F가 동일한지를 볼 것, 나머지는 크게 볼 필요 없음
- 선택한 사용자 정보와 후보간의 사는 곳의 거리가 비슷한지 볼 것.
- 선택한 사용자 정보와 후보간의 업무의 성격이 비슷하거나 호환이 좋은지 볼 것.
- 선택한 사용자 정보와 후보간의 서로 작성한 이상형이 비슷한지 볼 것.
- 선택한 사용자 정보와 후보간의 이성을 볼 때 우선순위가 비슷한지 볼 것.
3. 응답은 아래 JSON 형식으로 정확히 제공해주세요. 다른 설명은 추가하지 마세요:

{
  "recommendations": [
    {
      "id": "추천대상자ID",
      "reason": "추천 이유 설명"
    },
    {
      "id": "추천대상자ID",
      "reason": "추천 이유 설명"
    },
    {
      "id": "추천대상자ID",
      "reason": "추천 이유 설명"
    }
  ]
}`;
    
    console.log('AI 추천 알고리즘 요청 전송');
    const response = await axios.post('https://ai.tangibly.link/call/Claude-Sonnet-4', {
      apikey: apiKey,
      request: prompt
    });
    
    if (!response.data) {
      throw new Error('API에서 유효한 응답을 받지 못했습니다.');
    }
    var parsedJsonStr = response.data.replace('```json', '');
    parsedJsonStr = parsedJsonStr.replace('```', '');
    
    // Parse the API response
    const result = extractJsonFromText(parsedJsonStr);
    if (!result || !result.recommendations) {
      throw new Error('API 응답에서 추천 정보를 찾을 수 없습니다.');
    }
    
    // Process recommendations
    const recommendations = result.recommendations;
    if (recommendations.length === 0) {
      throw new Error('추천 목록이 비어있습니다.');
    }
    
    // Map recommendation IDs to full user objects and add reasons
    const processedRecommendations = recommendations.map(rec => {
      const user = oppositeGenderUsers.find(u => u.id === rec.id);
      if (!user) return null;
      
      return {
        ...user,
        reason: rec.reason || '적합한 매치로 판단됨'
      };
    }).filter(rec => rec !== null);
    
    // Update state with the recommendations
    topRecommendations.value = processedRecommendations;
    console.log('AI 추천 알고리즘 완료, 결과:', processedRecommendations);
    
  } catch (error) {
    console.error('AI 추천 알고리즘 오류:', error);
    alert(`추천 알고리즘 오류: ${error.message}`);
  } finally {
    recommendationLoading.value = false;
  }
}

// Helper function to extract JSON from text response
function extractJsonFromText(text) {
  try {
    // Try to parse the entire text as JSON
    return JSON.parse(text);
  } catch (e) {
    try {
      // Look for JSON object in the text with regex
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e2) {
      console.error('JSON 추출 오류:', e2);
    }
    return null;
  }
}

async function getAiAnalysis(match) {
  console.log('Starting AI analysis for match:', match.user.name);
  const matchUserId = match.user.id;
  if (aiAnalysisResults.value[matchUserId]) {
    return aiAnalysisResults.value[matchUserId];
  }
  try {
    aiLoading.value = true;
    aiError.value = '';
    // 환경 변수를 직접 참조하거나 vite.config.js에서 정의한 변수 사용
    const apiKey = import.meta.env.VITE_POE_API_KEY || import.meta.env.POE_API_KEY || 'oqblhi8pIB7QFd1aNeRYHh7xQfdEHGW9yu3G6EHLiQE'; 
    if (!apiKey) throw new Error('API 키를 찾을 수 없습니다. 환경 변수를 확인하세요.');
    const prompt = `

### 사용자 A 정보:
${match.mainUserInfo}

### 사용자 B 정보:
${match.matchUserInfo}

## 요청사항:
1. MBTI를 기반 매칭평가, S와 N이 가장 중요. F와 T가 그 다음으로 중요. 나머지는 중요하지 않음.
2. 이상형 우선순위 평가. 서로 상대방의 이상형이 일치하는지 평가.
3. 이성을 볼 때 우선순위 평가. 서로 이성을 볼 때 보는 부분이 일치하는지 평가.
4. 거리가 비슷한지 평가.
5. 직업이 궁합이 맞는지 평가. 혹은 비슷한 직업인지?
6. 나이가 적당한 차이가 있는지? 여성이 더 어린지?
두 사용자의 궁합 분석을 한국어로 제공해주세요.`;
    const response = await axios.post('https://ai.tangibly.link/call/gpt-4o-mini', {
      apikey: apiKey,
      request: prompt
    });
    if (response.data) {
      let analysisText = '';
      if (response.data.response) {
        analysisText = response.data.response;
      } else if (typeof response.data === 'string') {
        analysisText = response.data;
      } else if (response.data.text) {
        analysisText = response.data.text;
      } else if (response.data.result) {
        analysisText = response.data.result;
      } else {
        throw new Error('API 응답 구조가 예상과 다릅니다.');
      }
      aiAnalysisResults.value[matchUserId] = analysisText;
      return analysisText;
    } else {
      throw new Error('AI API에서 응답이 없습니다.');
    }
  } catch (error) {
    console.error('AI 분석 중 오류 발생:', error);
    aiError.value = error.message || '알 수 없는 오류가 발생했습니다.';
    throw error;
  } finally {
    aiLoading.value = false;
  }
}
</script>

<style scoped>
.matching-algorithm {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.main-user-selection {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selection-wrapper {
  margin-bottom: 1.5rem;
}

.user-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  background-color: #fff;
}


.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.recommendation-button {
  padding: 0.6rem 1.2rem;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.recommendation-button:hover {
  background-color: #7d3c98;
}

.recommendation-button:disabled {
  background-color: #bbb;
  cursor: not-allowed;
}

.recommended-matches {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  border-left: 4px solid #8e44ad;
}

.recommended-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.recommendation-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.recommendation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.recommendation-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.recommendation-rank {
  background-color: #8e44ad;
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.9rem;
}

.recommendation-details {
  padding: 1rem;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.select-button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.match-button {
  background-color: #2980b9;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.recommendation-reason {
  margin-top: 15px;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.reason-point {
  margin-bottom: 8px;
}

.reason-point p {
  margin: 0;
  line-height: 1.4;
}

.recommendation-reason h5 {
  margin-top: 0;
  margin-bottom: 0.6rem;
  color: #333;
}

.matching-results {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filters button {
  padding: 0.5rem 1rem;
  background-color: #f2f2f2;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.filters button.active {
  background-color: #3498db;
  color: white;
  border-color: #2980b9;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.match-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
}

.match-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.match-header h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.match-details {
  padding: 1rem;
}

.user-info {
  margin-bottom: 1.5rem;
}

.user-info p {
  margin: 0.3rem 0;
  color: #444;
}

.comparison {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.comparison-item {
  display: flex;
  align-items: center;
}

.comparison-item .label {
  flex: 0 0 90px;
  font-weight: 600;
  color: #555;
}

.comparison-item .value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.priorities-comparison {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.priorities-comparison h5 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.priorities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.priority-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.priority-label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.priority-values {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.priority-user, .priority-match {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.priority-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.priority-high {
  background-color: #e74c3c;
  color: white;
}

.priority-medium {
  background-color: #f39c12;
  color: white;
}

.priority-low {
  background-color: #95a5a6;
  color: white;
}

.match-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.ai-button {
  padding: 0.5rem 1rem;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.ai-button:hover {
  background-color: #7d3c98;
}

.ai-analysis {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 8px;
  border-left: 4px solid #8e44ad;
}

.ai-analysis h5 {
  margin-top: 0;
  color: #333;
  margin-bottom: 0.75rem;
}

.ai-analysis-content {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #444;
  white-space: pre-line;
}

.select-button {
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.select-button:hover {
  background-color: #2980b9;
}

.no-matches {
  padding: 2rem;
  text-align: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #777;
}

@media (max-width: 768px) {
  .priorities-grid {
    grid-template-columns: 1fr;
  }
  
  .comparison-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .comparison-item .label {
    flex: none;
  }
}
</style>
