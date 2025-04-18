<script setup>
// Features section component for dating event
</script>

<template>
  <section class="features">
    <h2 class="section-title">이벤트 특징</h2>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="icon">
          <i class="icon-calendar"></i>
        </div>
        <h3>맞춤형 매칭 시스템</h3>
        <p>매칭 알고리즘과 매칭 전문가 2분이 함께 최적의 짝을 찾아드립니다.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-location"></i>
        </div>
        <h3>편안한 만남 장소</h3>
        <p>식당이나 카페 등 편안하게 대화할 수 있는 장소에서 만남이 진행됩니다.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-people"></i>
        </div>
        <h3>균형 잡힌 참가자 구성</h3>
        <p>남성 50명, 여성 50명을 1:1 매칭하여 모두에게 공평한 기회를 제공합니다.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-heart"></i>
        </div>
        <h3>같은 가치관의 만남</h3>
        <p>유대감 있는 청년들 간의 의미 있는 만남을 통해 진정한 인연을 찾으실 수 있습니다.</p>
      </div>
    </div>
    
    <div class="event-details">
      <h2 class="section-title">이벤트 정보</h2>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-date"></i>
        </div>
        <div class="detail-content">
          <h4>모집 기간</h4>
          <p>2025년 4월 30일까지</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-match"></i>
        </div>
        <div class="detail-content">
          <h4>매칭 완료</h4>
          <p>2025년 5월 19일까지 매칭 알고리즘과 전문가를 통해 50쌍 연결 완료</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-schedule"></i>
        </div>
        <div class="detail-content">
          <h4>만남 일정</h4>
          <p>2025년 5월 내 일정 조율 (구체적인 식당/카페 장소는 5월 말 개별 통지)</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-info"></i>
        </div>
        <div class="detail-content">
          <h4>참가 대상 및 비용</h4>
          <p>남성 50명, 여성 50명 (선착순 모집) / 만남 당일 비용은 참가자 개인 부담</p>
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
.icon-heart:before { content: '\2764'; }
.icon-people:before { content: '\1F465'; }
.icon-date:before { content: '\1F4C5'; }
.icon-match:before { content: '\1F91D'; }
.icon-schedule:before { content: '\1F5D3'; }
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
