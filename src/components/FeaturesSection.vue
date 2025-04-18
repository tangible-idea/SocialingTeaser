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
        <h3>특별한 매칭 알고리즘</h3>
        <p>성격, 취미, 관심사를 기반으로 최적화된 매칭을 제공합니다.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-location"></i>
        </div>
        <h3>특별한 장소</h3>
        <p>서울 강남에 위치한 프리미엄 루프탑 레스토랑에서 진행됩니다.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-glass"></i>
        </div>
        <h3>와인 & 칵테일</h3>
        <p>고품질 와인과 전문 바리스타가 준비한 칵테일을 즐기실 수 있습니다.</p>
      </div>
      
      <div class="feature-card">
        <div class="icon">
          <i class="icon-people"></i>
        </div>
        <h3>유대감 있는 사람들</h3>
        <p>20-35세의 유대감 있는 사람들과 의미 있는 만남을 가질 수 있습니다.</p>
      </div>
    </div>
    
    <div class="event-details">
      <h2 class="section-title">이벤트 정보</h2>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-date"></i>
        </div>
        <div class="detail-content">
          <h4>일자</h4>
          <p>2025년 5월 15일 (목요일) 오후 6시</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-marker"></i>
        </div>
        <div class="detail-content">
          <h4>장소</h4>
          <p>서울 강남구 역삼동 XX빌딩 20층</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-ticket"></i>
        </div>
        <div class="detail-content">
          <h4>티켓</h4>
          <p><span class="highlight">일반 티켓: 5,000원</span> (예약 티켓: 15,000원)</p>
        </div>
      </div>
      
      <div class="detail-item">
        <div class="detail-icon">
          <i class="icon-info"></i>
        </div>
        <div class="detail-content">
          <h4>참가 대상</h4>
          <p>20-35세의 유대감 있는 사람들 (커플, 친구, 지인 등)</p>
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
