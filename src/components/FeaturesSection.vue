<script setup>
// Features section component for dating event
</script>

<template>
  <section class="features">
    <h2 class="section-title">uc774ubca4ud2b8 ud2b9uc9d5</h2>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="icon">
          <i class="icon-calendar"></i>
        </div>
        <h3>ud2b9ubcc4ud55c ub9e4uce6d uc54cuace0ub9acuc998</h3>
        <p>uc131uaca9, ucde8ubbf8, uad00uc2ecuc0acub97c uae30ubc18uc73cub85c ucd5cuc801ud654ub41c ub9e4uce6duc744 uc81cuacf5ud569ub2c8ub2e4.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-location"></i>
        </div>
        <h3>ud2b9ubcc4ud55c uc7a5uc18c</h3>
        <p>uc11cuc6b8 uac15ub0a8uc5d0 uc704uce58ud55c ud504ub9acubbf8uc5c4 ub8e8ud504ud0d1 ub808uc2a4ud1a0ub791uc5d0uc11c uc9c4ud589ub429ub2c8ub2e4.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-glass"></i>
        </div>
        <h3>uc74cub8cc & uc2a4ub0b5 uc81cuacf5</h3>
        <p>ub2e4uc591ud55c uce74ud14cuace0ub9acuc758 uc74cub8ccuc640 uace0uae09 uc2a4ub0b5uc774 ubb34uc81cud55c uc81cuacf5ub429ub2c8ub2e4.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-people"></i>
        </div>
        <h3>uc751uc6d0 uc774ubca4ud2b8</h3>
        <p>uc0acub78cub4e4uc774 uc11cub85c uc26cuc6b4 ubd84uc704uae30uc5d0uc11c ub300ud654ud560 uc218 uc788ub294 uc7acubbf8uc788ub294 uc751uc6d0 uc774ubca4ud2b8ub97c uc9c4ud589ud569ub2c8ub2e4.</p>
      </div>
    </div>
    
    <div class="event-details">
      <h2 class="section-title">uc774ubca4ud2b8 uc815ubcf4</h2>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-date"></i>
        </div>
        <div class="detail-content">
          <h4>ub0a0uc9dc</h4>
          <p>2025ub144 5uc6d4 15uc77c (ud1a0uc694uc77c) uc624ud6c4 6uc2dc</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-marker"></i>
        </div>
        <div class="detail-content">
          <h4>uc7a5uc18c</h4>
          <p>uc11cuc6b8uc2dc uac15ub0a8uad6c uc2e0uc0acub3d9 ub8e8ud504ud0d1 ub808uc2a4ud1a0ub791 (XXube4cub529 20uce35)</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-ticket"></i>
        </div>
        <div class="detail-content">
          <h4>uac00uaca9</h4>
          <p><span class="highlight">uc120ucc29uc21c 100uba85 ud2b9ubcc4uac00: 5,000uc6d0</span> (uc815uc0c1uac00 15,000uc6d0)</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-info"></i>
        </div>
        <div class="detail-content">
          <h4>ucc38uac00uc870uac74</h4>
          <p>25-35uc138 uc131uc778 ub0a8ub140 (uc2e0ubd84uc99d ud655uc778 ud544uc218)</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 5rem 2rem;
  background-color: #f9f9f9;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #333;
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
  background: linear-gradient(to right, #ff6b6b, #794bc4);
  border-radius: 2px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1.5rem;
  background-color: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #794bc4;
}

.feature-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.event-details {
  max-width: 800px;
  margin: 0 auto;
}

.detail-item {
  display: flex;
  margin-bottom: 2rem;
  align-items: center;
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.detail-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff6b6b, #794bc4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.detail-content h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.detail-content p {
  color: #666;
  line-height: 1.6;
}

.highlight {
  color: #ff3366;
  font-weight: 700;
}

/* Placeholder icons */
[class*="icon-"] {
  font-style: normal;
}

.icon-calendar:before { content: '\1F4C5'; }
.icon-location:before { content: '\1F4CD'; }
.icon-glass:before { content: '\1F942'; }
.icon-people:before { content: '\1F465'; }
.icon-date:before { content: '\1F4C5'; }
.icon-marker:before { content: '\1F4CD'; }
.icon-ticket:before { content: '\1F3AB'; }
.icon-info:before { content: '\2139'; }

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>
