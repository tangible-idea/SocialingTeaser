import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// 앱이 마운트되기 전에 인증 상태 초기화
import { useAuthStore } from './stores/authStore'
const { getUser, setupAuthListener } = useAuthStore()

// 인증 상태 로드 및 이벤트 리스너 설정
getUser()
setupAuthListener()

app.mount('#app')
