// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import AppHome from '@/views/AppHome.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import AdminPage from '@/views/AdminPage.vue'
import TestHome from '@/views/TestHome.vue'

// ✅ Định nghĩa các routes
const routes = [
  { path: '/', name: 'Home', component: AppHome },
  { path: '/test', name: 'Test', component: TestHome },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: { requiresAuth: true } // 👈 Bảo vệ route
  }
]

// ✅ Tạo router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Navigation Guard: kiểm tra đăng nhập và quyền admin
router.beforeEach((to, from, next) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null')
  const isAuthenticated = !!currentUser
  
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Chưa đăng nhập -> chuyển về login
      next('/login')
      return
    }
    
    // Kiểm tra quyền admin cho trang admin
    if (to.name === 'Admin' && currentUser.role !== 'admin') {
      // Không phải admin -> chuyển về home với thông báo
      alert('Bạn không có quyền truy cập trang quản trị!')
      next('/')
      return
    }
  }
  
  next()
})

export default router
