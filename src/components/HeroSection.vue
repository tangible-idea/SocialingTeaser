<script setup>
import { ref, onMounted } from 'vue';
import supabase from '../supabase';

const profiles = ref([]);
const loading = ref(true);
const error = ref(null);

async function fetchProfiles() {
  try {
    loading.value = true;
    const { data, error: err } = await supabase
      .from('dating')
      .select('gender, height, field')
      .order('created_at', { ascending: false });
    
    if (err) throw err;
    
    profiles.value = data;
    loading.value = false;
  } catch (err) {
    console.error('Error fetching profiles:', err);
    error.value = 'Failed to load profiles data';
    loading.value = false;
  }
}

onMounted(() => {
  fetchProfiles();
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
        <p>- 이런 친구들이 주변에 많아서 한번 만들어봤습니다. 문뜩 이런 교회 친구들을 전부 모아서 연결해주면 어떨까 생각해봤습니다.</p>
      </div>
      
      <div class="promotion">
        <div class="title-wrapper">
          <h3 class="section-title">현재 신청목록</h3>
          <span class="realtime-label">실시간</span>
        </div>
        <div class="participants-list">
          <div v-if="loading" class="loading">데이터를 불러오는 중...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else-if="profiles.length === 0" class="no-participants">아직 등록된 참가자가 없습니다.</div>
          <div v-else class="profile-entries">
            <div v-for="(profile, index) in profiles.slice(0, 5)" :key="index" class="profile-entry">
              <span class="profile-name">
                {{ profile.gender }}
                <span class="gender-emoji">{{ profile.gender === '남성' ? '👨' : profile.gender === '여성' ? '👩' : '' }}</span>
              </span>
              <span class="profile-details">{{ profile.height }}cm, {{ profile.field }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 네이버 스마트 스토어로 연결 -->
      <a href="https://smartstore.naver.com/tangible/products/11422139807" target="_blank" class="cta-button">
        <svg class="naver-icon" width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 4H10.2V12H11V4Z" fill="currentColor"/>
          <path d="M5 4H4V12H5L9 7V12H10V4H9L5 9V4Z" fill="currentColor"/>
        </svg>
        네이버에서 구매하기
      </a>
    </div>
  </section>
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
  height: 160px; /* 높이를 조정하여 약 2.5개의 프로필이 보이도록 설정 */
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

.profile-entries {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-entry {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.cta-button {
  background-color: #19ce60; /* 신청하기 버튼 색상 */
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
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3);
  background-color: #00b843; /* 신청하기 버튼 호버 색상 */
}

.naver-icon {
  margin-right: 14px;
  font-size: 1.3em;
}

@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
    min-height: 90vh;
  }
  
  .english-title {
    font-size: 1.5rem;
  }
  
  .intro-text {
    font-size: 0.95rem;
    padding: 1.2rem;
  }
  
  h1 {
    font-size: 2.5rem;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .promotion {
    padding: 1rem;
    margin: 1.5rem auto;
  }
  
  .cta-button {
    font-size: 1.25rem;
    padding: 0.75rem 2rem;
    width: 100%;
    max-width: 300px;
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
  }
}
</style>
