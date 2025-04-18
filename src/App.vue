<script setup>
import HeroSection from './components/HeroSection.vue';
import FeaturesSection from './components/FeaturesSection.vue';
import TestimonialsSection from './components/TestimonialsSection.vue';
import RegistrationForm from './components/RegistrationForm.vue';
import FooterSection from './components/FooterSection.vue';
</script>

<template>
  <div class="app">
    <HeroSection />
    <FeaturesSection />
    <TestimonialsSection />
    <RegistrationForm />
    <FooterSection />
  </div>
</template>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Noto Sans KR', 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  overflow: hidden;
}

button {
  cursor: pointer;
}

h1, h2, h3, h4, h5, h6 {
  line-height: 1.2;
}

section {
  overflow: hidden;
}
</style>
