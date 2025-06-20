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
        // 디버깅: 현재 URL 출력
        console.log('현재 URL:', window.location.href)
        
        // URL에서 인증 코드와 next 파라미터 추출
        const url = new URL(window.location.href)
        console.log('파싱된 URL 객체:', {
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          params: Object.fromEntries(url.searchParams)
        })
        
        // 쿼리 파라미터에서 오류 검사 먼저 수행
        const error = url.searchParams.get('error')
        const errorCode = url.searchParams.get('error_code')
        const errorDescription = url.searchParams.get('error_description')
        
        if (error) {
          console.error('OAuth 쿼리 파라미터 오류 발생:', {
            error,
            errorCode,
            errorDescription
          })
          
          // 오류 메시지를 쿼리 파라미터로 추가하여 로그인 페이지로 리디렉션
          return router.push(`/login?oauthError=${error}&errorDescription=${encodeURIComponent(errorDescription || '')}`)
        }
        
        // URL 해시에서 데이터 추출 (# 다음 부분)
        let hashParams = {}
        if (url.hash) {
          // # 제거하고 파라미터 파싱
          const hashString = url.hash.substring(1)
          const hashSearchParams = new URLSearchParams(hashString)
          hashParams = Object.fromEntries(hashSearchParams)
          console.log('URL 해시에서 추출한 파라미터:', hashParams)
        }
        
        // 해시에서 access_token 찾기
        const accessToken = hashParams.access_token
        
        // next 파라미터가 있으면 사용, 없으면 기본값 '/'
        let next = url.searchParams.get('next') ?? '/'
        
        // next가 상대 URL이 아니면 기본값 사용
        if (!next.startsWith('/')) {
          next = '/'
        }
        
        // 쿼리 파라미터에서 code 찾기
        const code = url.searchParams.get('code')
        
        // 1. 먼저 코드가 있는지 확인 (Authorization Code Flow)
        if (code) {
          console.log('인증 코드 교환 시작:', code)
          // 인증 코드를 세션으로 교환
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          console.log('인증 코드 교환 결과:', error ? '오류 발생' : '성공')
          
          if (!error) {
            console.log('인증 성공 (코드 방식), 리다이렉트:', next)
            router.push(next)
            return
          } else {
            console.error('인증 코드 교환 오류:', error.message)
          }
        } 
        // 2. access_token이 있는지 확인 (Implicit Flow)
        else if (accessToken) {
          console.log('액세스 토큰 발견 - 세션 설정 시도')
          
          // Supabase 세션 설정
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.refresh_token || ''
          })
          
          if (!error && data) {
            console.log('세션 설정 성공:', data)
            console.log('인증 성공 (토큰 방식), 리다이렉트:', next)
            router.push(next)
            return
          } else {
            console.error('세션 설정 오류:', error)
            return router.push(`/login?oauthError=session_error&errorDescription=${encodeURIComponent('세션 설정 실패')}`)
          }
        } 
        // 3. 둘 다 없는 경우 오류 처리
        else {
          console.error('인증 정보가 없습니다 (코드도 토큰도 없음)')
          console.error('원시 URL:', window.location.toString())
          
          // URL 해시에 error가 있는지 확인
          if (hashParams.error) {
            console.error('URL 해시에서 오류 발견:', {
              error: hashParams.error,
              errorDescription: hashParams.error_description
            })
            return router.push(`/login?oauthError=${hashParams.error}&errorDescription=${encodeURIComponent(hashParams.error_description || '')}`)
          }
        }
        
        // 오류 발생 시 로그인 페이지로 리다이렉트 (구체적인 오류 메시지 포함)
        router.push('/login?error=auth-code-error&errorDescription=' + encodeURIComponent('인증 코드를 찾을 수 없습니다'))
      } catch (err) {
        console.error('인증 처리 중 오류 발생:', err)
        console.error('오류 상세정보:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        })
        router.push('/login?error=auth-code-error')
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
