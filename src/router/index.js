import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
