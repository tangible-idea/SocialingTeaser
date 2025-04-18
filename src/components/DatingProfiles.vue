<script setup>
import { ref, onMounted } from 'vue';
import supabase from '../supabase';

const profiles = ref([]);
const loading = ref(true);
const error = ref(null);

async function fetchProfiles() {
  try {
    const { data, error: supabaseError } = await supabase
      .from('dating')
      .select('gender, height, field');
      
    if (supabaseError) throw supabaseError;
    
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
  <section class="profiles-section">
    <h2 class="section-title">현재 등록된 참가자들</h2>
    
    <div class="profiles-container">
      <div v-if="loading" class="loading">데이터를 불러오는 중...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else-if="profiles.length === 0" class="no-data">아직 등록된 참가자가 없습니다.</div>
      
      <div v-else class="animation-container">
        <transition-group 
          name="profile-scroll" 
          tag="div" 
          class="profiles-ticker">
          <div 
            v-for="(profile, index) in [...profiles, ...profiles]" 
            :key="`${index}-${profile.field}`"
            class="profile-card"
          >
            <div class="profile-icon" :class="profile.gender === '남성' ? 'male' : 'female'">
              {{ profile.gender === '남성' ? '👨' : '👩' }}
            </div>
            <div class="profile-details">
              <p><span class="label">성별:</span> {{ profile.gender }}</p>
              <p><span class="label">키:</span> {{ profile.height }}cm</p>
              <p><span class="label">직업:</span> {{ profile.field }}</p>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profiles-section {
  padding: 4rem 1rem;
  background-color: var(--cream);
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: var(--dark-brown);
  position: relative;
}

.section-title:after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, var(--primary-brown), var(--light-brown));
  border-radius: 2px;
}

.profiles-container {
  max-width: 900px;
  margin: 0 auto;
  overflow: hidden;
  position: relative;
  height: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.1);
}

.loading, .error, .no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 1.2rem;
  color: var(--text-light);
}

.animation-container {
  height: 100%;
  overflow: hidden;
  position: relative;
}

.profiles-ticker {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 100%;
  animation: scroll 30s linear infinite;
}

@keyframes scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  background-color: white;
  transition: all 0.3s ease;
}

.profile-card:hover {
  background-color: #f9f9f9;
  transform: scale(1.02);
}

.profile-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  font-size: 2rem;
  flex-shrink: 0;
}

.profile-icon.male {
  background-color: #e6f7ff;
  color: #0077cc;
}

.profile-icon.female {
  background-color: #fff0f6;
  color: #eb2f96;
}

.profile-details {
  flex-grow: 1;
}

.profile-details p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: var(--text-color);
}

.label {
  font-weight: 600;
  color: var(--dark-brown);
  margin-right: 0.5rem;
}

.profile-scroll-enter-active,
.profile-scroll-leave-active {
  transition: all 0.5s ease;
}

.profile-scroll-enter-from {
  transform: translateY(30px);
  opacity: 0;
}

.profile-scroll-leave-to {
  transform: translateY(-30px);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .profiles-container {
    height: 350px;
  }
  
  .profile-card {
    padding: 1rem;
  }
  
  .profile-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .profile-details p {
    font-size: 1rem;
  }
}
</style>
