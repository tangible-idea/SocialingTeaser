import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SubmittedPage from '../views/SubmittedPage.vue'

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
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminPage.vue')
  },
  {
    path: '/matching/:uuid',
    name: 'MatchingDetail',
    component: () => import('../views/MatchingDetailPage.vue')
  },
  {
    path: '/submitted',
    name: 'Submitted',
    component: SubmittedPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
