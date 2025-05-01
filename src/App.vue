<script setup>
import { onMounted } from 'vue';
import HeroSection from './components/HeroSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import TestimonialsSection from './components/TestimonialsSection.vue';
import RegistrationForm from './components/RegistrationForm.vue';
import FooterSection from './components/FooterSection.vue';
import DatingProfiles from './components/DatingProfiles.vue';
import VisitorCounter from './components/VisitorCounter.vue';
import { trackPageView } from './analytics';

onMounted(() => {
  // Track initial page view when app loads
  trackPageView('homepage');
});
</script>

<template>
  <div class="app">
    <HeroSection />
    <FeaturesSection />
    <!-- <DatingProfiles /> -->
    <!-- <TestimonialsSection /> -->
    <!-- <RegistrationForm /> -->
    <FooterSection />
    <VisitorCounter />
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
