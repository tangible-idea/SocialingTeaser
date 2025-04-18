<script setup>
// Footer component
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h3>ub9e4uce6d ub370uc774ud305 uc774ubca4ud2b8</h3>
        <p>uc5b8uc81c: 2025ub144 5uc6d4 15uc77c (ud1a0uc694uc77c) uc624ud6c4 6uc2dc</p>
        <p>uc5b4ub514uc11c: uc11cuc6b8uc2dc uac15ub0a8uad6c uc2e0uc0acub3d9 ub8e8ud504ud0d1 ub808uc2a4ud1a0ub791</p>
      </div>
      
      <div class="footer-section">
        <h3>ubb38uc758ud558uae30</h3>
        <p>uc804ud654: 010-1234-5678</p>
        <p>uc774uba54uc77c: info@matchevent.co.kr</p>
      </div>
      
      <div class="footer-section social-links">
        <h3>uc18cuc15c ubbf8ub514uc5b4</h3>
        <div class="social-icons">
          <a href="#" class="social-icon">u{1F4F2}</a>
          <a href="#" class="social-icon">u{1F310}</a>
          <a href="#" class="social-icon">u{1F4E7}</a>
          <a href="#" class="social-icon">u{1F4F8}</a>
        </div>
      </div>
    </div>
    
    <div class="copyright">
      <p>&copy; {{ currentYear }} ub9e4uce6d ub370uc774ud305 uc774ubca4ud2b8. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #333;
  color: white;
  padding: 4rem 2rem 2rem;
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
}

.footer-section h3:after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(to right, #ff6b6b, #794bc4);
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
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  transition: background-color 0.3s, transform 0.3s;
}

.social-icon:hover {
  background-color: rgba(255, 255, 255, 0.2);
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
}
</style>
