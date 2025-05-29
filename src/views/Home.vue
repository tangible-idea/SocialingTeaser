<script setup>
import HeroSection from '../components/HeroSection.vue';
import FeaturesSection from '../components/FeaturesSection.vue';
import FooterSection from '../components/FooterSection.vue';
import VisitorCounter from '../components/VisitorCounter.vue';
import { onMounted } from 'vue';
import { trackPageView } from '../analytics';

onMounted(() => {
  // Track initial page view when app loads
  trackPageView('homepage');
});
</script>

<template>
  <div class="home">
    <HeroSection />
    <FeaturesSection />
    <FooterSection />
    <VisitorCounter />
  </div>
</template>

<style scoped>
.home {
  overflow: hidden;
  max-width: 100%;
}
</style>
