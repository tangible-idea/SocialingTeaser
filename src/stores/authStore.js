import { ref } from 'vue'
import supabase from '../supabase'

// 인증 상태 관리 스토어
export const useAuthStore = () => {
  const user = ref(null)
  const isLoading = ref(true)
  const error = ref(null)
  
  // 현재 로그인한 사용자 정보 가져오기
  const getUser = async () => {
    isLoading.value = true
    try {
      const { data } = await supabase.auth.getSession()
      user.value = data?.session?.user || null
    } catch (err) {
      console.error('Auth error:', err)
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }
  
  // 로그아웃 처리
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      user.value = null
    } catch (err) {
      console.error('Logout error:', err)
      error.value = err.message
    }
  }
  
  // Supabase auth 상태 변경 이벤트 리스너 설정
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        user.value = session.user
      } else if (event === 'SIGNED_OUT') {
        user.value = null
      }
    })
  }
  
  return {
    user,
    isLoading,
    error,
    getUser,
    signOut,
    setupAuthListener
  }
}
