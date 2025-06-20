<template>
  <div class="login-page">
    <div class="login-container">
      <h2>관리자 로그인</h2>
      
      <div class="alert error" v-if="error">{{ error }}</div>
      <div class="alert success" v-if="message">{{ message }}</div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">이메일</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="관리자 이메일" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="비밀번호" 
            required
          />
        </div>
        
        <button 
          type="submit" 
          class="login-button" 
          :disabled="isLoading"
        >
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
      
      <div class="social-login">
        <p>또는 소셜 로그인</p>
        <button 
          @click="handleKakaoLogin" 
          class="kakao-login-button"
          type="button"
          :disabled="isLoading"
        >
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_small.png" alt="Kakao" class="kakao-icon">
          카카오로 로그인
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import supabase from '../supabase'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const message = ref('')
    const isLoading = ref(false)

    const handleKakaoLogin = async () => {
      error.value = ''
      message.value = ''
      isLoading.value = true
      
      try {
        const { data, error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'kakao',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              scope: 'profile_nickname,profile_image,account_email'
            }
          }
        })
        
        if (authError) throw authError
        
        // 리다이렉트가 자동으로 처리됨
      } catch (err) {
        error.value = '카카오 로그인 실패: ' + (err.message || '알 수 없는 오류가 발생했습니다.')
        isLoading.value = false
      }
    }
    
    const handleLogin = async () => {
      error.value = ''
      message.value = ''
      isLoading.value = true
      
      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        })
        
        if (authError) throw authError
        
        // Login successful, redirect to admin
        router.push('/admin')
      } catch (err) {
        error.value = '로그인 실패: ' + (err.message || '알 수 없는 오류가 발생했습니다.')
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      email,
      password,
      error,
      message,
      isLoading,
      handleLogin,
      handleKakaoLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #2980b9;
}

.login-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.social-login {
  margin-top: 1.5rem;
  text-align: center;
}

.social-login p {
  color: #777;
  margin-bottom: 1rem;
  position: relative;
}

.social-login p::before,
.social-login p::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #ddd;
}

.social-login p::before {
  left: 0;
}

.social-login p::after {
  right: 0;
}

.kakao-login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #FEE500;
  color: #191919;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.kakao-login-button:hover {
  background-color: #E6CF00;
}

.kakao-login-button:disabled {
  background-color: #fef29d;
  cursor: not-allowed;
}

.kakao-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}
</style>
