<script setup>
import { onMounted, ref } from 'vue';
import HeroSection from './components/HeroSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import TestimonialsSection from './components/TestimonialsSection.vue';
import RegistrationForm from './components/RegistrationForm.vue';
import FooterSection from './components/FooterSection.vue';
import DatingProfiles from './components/DatingProfiles.vue';
import VisitorCounter from './components/VisitorCounter.vue';
import { trackPageView } from './analytics';
import UserProfile from './components/UserProfile.vue';

// 현재 보여줄 페이지 상태 관리
const currentView = ref('home'); // 'home' 또는 'profile'

function showHome() {
  currentView.value = 'home';
  trackPageView('homepage');
}

function showProfile() {
  currentView.value = 'profile';
  trackPageView('profile_page');
}

onMounted(() => {
  // Track initial page view when app loads
  trackPageView('homepage');
});
</script>

<template>
  <div class="app">
    <!-- 네비게이션 메뉴 -->
    <nav class="nav-menu">
      <div class="container">
        <div class="nav-content">
          <div class="logo" @click="showHome">Tangible Christian Dating</div>
          <div class="nav-links">
            <button @click="showHome" :class="{'active': currentView === 'home'}">홈</button>
            <button @click="showProfile" :class="{'active': currentView === 'profile'}">내 정보</button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 홈 페이지 콘텐츠 -->
    <div v-if="currentView === 'home'">
      <HeroSection />
      <FeaturesSection />
      <!-- <DatingProfiles /> -->
      <!-- <TestimonialsSection /> -->
      <!-- <RegistrationForm /> -->
      <FooterSection />
      <VisitorCounter />
    </div>
    
    <!-- 프로필 페이지 -->
    <div v-else-if="currentView === 'profile'">
      <UserProfile />
    </div>
  </div>
</template>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-brown: #8B5A2B;
  --secondary-brown: #A67C52;
  --light-brown: #D4B996;
  --cream: #F5EBE0;
  --dark-brown: #4A3728;
  --text-color: #3F2E22;
  --text-light: #6B5344;
  --accent: #C8A27C;
}

html {
  scroll-behavior: smooth;
  font-size: 16px;
}

@media (max-width: 768px) {
  html {
    font-size: 14px;
  }
}

body {
  font-family: 'Noto Sans KR', 'Arial', sans-serif;
  line-height: 1.6;
  color: var(--text-color);
  background-color: var(--cream);
}

.app {
  overflow: hidden;
  max-width: 100%;
  padding-top: 60px; /* 네비게이션 메뉴 높이만큼 패딩 추가 */
}

button {
  cursor: pointer;
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.2;
  color: var(--dark-brown);
}

section {
  overflow: hidden;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Mobile Optimizations */
input, select, textarea, button {
  font-size: 16px; /* Prevents zooming on mobile when focusing inputs */
}

/* 네비게이션 메뉴 스타일 */
.nav-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--dark-brown);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 1rem;
}

.logo {
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-links button {
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-links button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-links button.active {
  background-color: var(--primary-brown);
  color: white;
}

/* Add a standard container class for consistent spacing */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0 0.75rem;
  }
}
</style>
