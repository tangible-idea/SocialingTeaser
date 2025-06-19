import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SubmittedPage from '../views/SubmittedPage.vue'
import supabase from '../supabase'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/profile/:id',
    name: 'Profile',
    component: () => import('../views/ProfilePage.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/matching/:uuid',
    name: 'MatchingDetail',
    component: () => import('../views/MatchingDetailPage.vue')
  },
  {
    path: '/admin/user-map',
    name: 'UserLocationMap',
    component: () => import('../views/admin/UserLocationMap.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/submitted',
    name: 'Submitted',
    component: SubmittedPage
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/AuthCallback.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 전역 네비게이션 가드 설정
router.beforeEach(async (to, from, next) => {
  // 인증이 필요한 페이지인지 확인
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    // 인증 세션 확인
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
