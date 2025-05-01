<script setup>
import { ref, onMounted } from 'vue';
import { trackSectionView } from '../analytics';

// Features section component for dating event

const featuresSectionRef = ref(null);

onMounted(() => {
  // Create IntersectionObserver to track when Features section is viewed
  if (featuresSectionRef.value) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // If section becomes visible
          if (entry.isIntersecting) {
            // Track the section view event
            trackSectionView('features_section');
            // Disconnect observer after first view to avoid multiple events
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 } // Fire when at least 30% of the section is visible
    );
    
    // Start observing the section
    observer.observe(featuresSectionRef.value);
  }
});
</script>

<template>
  <section class="features" ref="featuresSectionRef">
    <h2 class="section-title">어떻게 진행되나요?</h2>
    <p class="section-intro">교회 청년들의 만남이 어떻게 진행되는지 플로우를 설명해드릴게요!</p>
    
    <div class="flow-container">
      <div class="flow-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>신청 접수</h3>
          <div class="step-icon">
            <i class="icon-signup"></i>
          </div>
          <p>교회의 청년분들 남자 50명, 여자 50명을 컨택해서 5월까지 모집하고 있어요. 현재는 할인쿠폰 적용시, <b>4000-5000원</b> 선입니다.</p>
          <div class="date-tag">~ 5월 19일</div>
        </div>
      </div>
      
      <div class="flow-arrow">
        <i class="icon-arrow-down"></i>
      </div>
      
      <div class="flow-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>매칭 진행</h3>
          <div class="step-icon">
            <i class="icon-matching"></i>
          </div>
          <p>설문조사 내용을 기반으로 데이터 전문가 1명, 매칭 전문가 1명이 함께 최적의 짝을 찾아드리고 있어요..</p>
          <div class="date-tag">~ 5월 중순</div>
        </div>
      </div>
      
      <div class="flow-arrow">
        <i class="icon-arrow-down"></i>
      </div>
      
      <div class="flow-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>매칭 결과 발표</h3>
          <div class="step-icon">
            <i class="icon-results"></i>
          </div>
          <p>귀하의 매칭 결과를 개별적으로 알려드립니다. 매칭이 안될 가능성도 있습니다. 이에 경우에는 전액환불해드립니다. 6월에 새롭게 2차 매칭도 준비중이니, 새로 알림을 원하신다고 체크하신 분만 입력하신 번호로 알려드릴게요!</p>
          <div class="date-tag">5월 31일</div>
        </div>
      </div>
      
      <div class="flow-arrow">
        <i class="icon-arrow-down"></i>
      </div>
      
      <div class="flow-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>만남 일정 조율</h3>
          <div class="step-icon">
            <i class="icon-calendar"></i>
          </div>
          <p>서로의 일정에 맞춰 만남 날짜를 정할 수 있도록 도와드릴게요. 두 분이 서로 일정이 맞아야 진행됩니다!</p>
          <div class="date-tag">6월 중</div>
        </div>
      </div>
      
      <div class="flow-arrow">
        <i class="icon-arrow-down"></i>
      </div>
      
      <div class="flow-step">
        <div class="step-number">5</div>
        <div class="step-content">
          <h3>만남 장소 안내</h3>
          <div class="step-icon">
            <i class="icon-location"></i>
          </div>
          <p>저희가 두 분이 만날때 시너지를 낼 장소도 같이 알려드려요!
            조용하고 편안한 식당이나 카페를 추천해드릴게요. </p>
          <div class="date-tag">6월 중</div>
        </div>
      </div>
    </div>
    
    <div class="final-note">
      <div class="note-icon">
        <i class="icon-heart"></i>
      </div>
      <div class="note-content">
        <h3>진심어린 만남을 응원합니다</h3>
        <p>이번 만남을 통해 정말 소중한 인연을 찾으시길 기도할게요. 만렬히 준비되었다면 지금 바로 신청해주세요!</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 5rem 2rem;
  background-color: #f9f9f9;
  font-family: 'Pretendard', sans-serif;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--dark-brown);
}

.section-intro {
  text-align: center;
  font-size: 1.2rem;
  color: var(--secondary-brown);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.flow-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-step {
  display: flex;
  margin-bottom: 1rem;
  width: 100%;
  position: relative;
}

.step-number {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 1.5rem;
  flex-shrink: 0;
  z-index: 2;
}

.step-content {
  flex-grow: 1;
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
}

.step-icon {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(var(--accent-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 1.2rem;
}

.date-tag {
  display: inline-block;
  background-color: var(--dark-brown);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.step-content h3 {
  font-size: 1.5rem;
  color: var(--dark-brown);
  margin-bottom: 2rem;
}

.step-content p {
  color: #666;
  line-height: 1.6;
  font-size: 1.1rem;
}

.flow-arrow {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-brown);
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

.final-note {
  display: flex;
  align-items: center;
  background-color: rgba(var(--accent-rgb), 0.05);
  padding: 2rem;
  border-radius: 12px;
  margin-top: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.note-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--light-brown));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  margin-right: 1.5rem;
  flex-shrink: 0;
}

.note-content h3 {
  font-size: 1.3rem;
  color: var(--dark-brown);
  margin-bottom: 0.5rem;
}

.note-content p {
  color: #666;
  line-height: 1.6;
}

/* Placeholder icons */
[class*="icon-"] {
  font-style: normal;
}

.icon-signup:before { content: '\1F4DD'; }
.icon-matching:before { content: '\1F91D'; }
.icon-results:before { content: '\1F4E9'; }
.icon-calendar:before { content: '\1F4C5'; }
.icon-location:before { content: '\1F4CD'; }
.icon-heart:before { content: '\2764'; }
.icon-arrow-down:before { content: '\2193'; }

@media (max-width: 768px) {
  .features {
    padding: 3rem 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    margin-right: 1rem;
  }
  
  .step-content {
    padding: 1.2rem;
  }
  
  .step-icon {
    width: 35px;
    height: 35px;
    font-size: 1rem;
    top: 1.2rem;
    right: 1.2rem;
  }
  
  .step-content h3 {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    margin-right: 40px;
  }
  
  .step-content p {
    font-size: 1rem;
  }
  
  .final-note {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  
  .note-icon {
    margin-bottom: 1rem;
    margin-right: 0;
  }
}
</style>
