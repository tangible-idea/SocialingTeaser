<script setup>
import { ref, onMounted } from 'vue';
import { trackSectionView } from '../analytics';

const currentYear = new Date().getFullYear();
const footerSectionRef = ref(null);

onMounted(() => {
  // Create IntersectionObserver to track when Footer section is viewed
  if (footerSectionRef.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // If section becomes visible
          if (entry.isIntersecting) {
            // Track the section view event
            trackSectionView('footer_section');
            // Disconnect observer after first view to avoid multiple events
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 } // Fire when at least 30% of the section is visible
    );
    
    // Start observing the section
    observer.observe(footerSectionRef.value);
  }
});
</script>

<template>
  <footer class="footer" ref="footerSectionRef">
    <div class="footer-content">
      <div class="footer-section">
        <h3>매칭 데이팅 이벤트</h3>
        <p>사업자등록번호: 183-24-00392</p>
        <p>통신판매업신고번호: 2021-성남분당B-0404</p>
      </div>
      
      <div class="footer-section">
        <h3>문의하기</h3>
        <p>카카오: <a href="http://pf.kakao.com/_JaFsn">@텐저블아이디어</a></p>
        <p>이메일: <a href="mailto:mark.choi@tangibleidea.net">mark.choi@tangibleidea.net</a></p>
      </div>
      
      <!-- <div class="footer-section social-links">
        <h3>소셜 미디어</h3>
        <div class="social-icons">
          <a href="#" class="social-icon">📲</a>
          <a href="#" class="social-icon">🌐</a>
          <a href="#" class="social-icon">📧</a>
          <a href="#" class="social-icon">📸</a>
        </div>
      </div> -->
    </div>
    
    <div class="copyright">
      <p>&copy; {{ currentYear }} TangibleIdea All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--dark-brown);
  color: var(--cream);
  padding: 4rem 1rem 2rem;
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-section {
  flex: 1;
  min-width: 250px;
}

.footer-section h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  position: relative;
  color: var(--light-brown);
}

.footer-section h3:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, var(--secondary-brown), var(--accent));
  border-radius: 1.5px;
}

.footer-section p {
  margin-bottom: 0.7rem;
  color: #bbb;
  line-height: 1.6;
}

.social-icons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--secondary-brown);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  transition: background-color 0.3s, transform 0.3s;
}

.social-icon:hover {
  background-color: var(--accent);
  transform: translateY(-3px);
}

.copyright {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #777;
}

@media (max-width: 768px) {
  .footer {
    padding: 3rem 1rem 1.5rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }
  
  .footer-section {
    text-align: center;
  }
  
  .footer-section h3:after {
    left: 50%;
    transform: translateX(-50%);
  }
  
  .social-icons {
    justify-content: center;
  }
  
  .copyright {
    margin-top: 2rem;
    padding-top: 1.5rem;
  }
}
</style>
