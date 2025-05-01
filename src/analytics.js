import { getAnalytics, logEvent } from 'firebase/analytics';
import firebaseSetup from './firebase';

const analytics = firebaseSetup.analytics;

// 1. 접속 통계
export const trackPageView = (pageName) => {
  logEvent(analytics, 'page_view', {
    page_name: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

// 2. 버튼 클릭 통계
export const trackButtonClick = (buttonName) => {
  logEvent(analytics, 'button_click', {
    button_name: buttonName,
    timestamp: new Date().toISOString()
  });
};

// 3 & 4. 스크롤 추적 통계
export const trackSectionView = (sectionName) => {
  logEvent(analytics, 'section_view', {
    section_name: sectionName,
    timestamp: new Date().toISOString()
  });
};

// 5. 폼 단계 완료 추적
export const trackFormStep = (stepNumber, isComplete = false) => {
  logEvent(analytics, 'form_interaction', {
    step_number: stepNumber,
    action: isComplete ? 'complete' : 'start',
    timestamp: new Date().toISOString()
  });
};

// 폼 제출 완료 추적
export const trackFormSubmission = (success = true) => {
  logEvent(analytics, 'form_submission', {
    success: success,
    timestamp: new Date().toISOString()
  });
};
