<template>
  <div class="callback-container">
    <div class="loader"></div>
    <p>인증 처리 중입니다...</p>
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import supabase from '../supabase'

export default {
  name: 'AuthCallback',
  setup() {
    const router = useRouter()

    onMounted(async () => {
      try {
        // 소셜 로그인 완료 후 세션 처리
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('인증 오류:', error.message)
          router.push('/login')
        } else if (data?.session) {
          // 관리자 계정인지 확인하는 로직 필요
          // 예시: 관리자 테이블/필드 확인 또는 특정 이메일 도메인 확인
          console.log('로그인 성공:', data.session.user)
          router.push('/admin')
        } else {
          router.push('/login')
        }
      } catch (err) {
        console.error('인증 처리 중 오류 발생:', err)
        router.push('/login')
      }
    })

    return {}
  }
}
</script>

<style scoped>
.callback-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  color: #555;
  font-size: 1.2rem;
}
</style>
