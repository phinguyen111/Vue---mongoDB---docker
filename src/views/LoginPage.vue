<template>
  <div class="auth-page">
    <!-- Logo Section -->
    <div class="logo-section">
      <div class="logo-container">
        <h1 class="digital-library-title">Digital Library</h1>
      </div>
    </div>

    <!-- Login Form -->
    <div class="container">
      <div class="auth-section">
        <div class="auth-card">
          <div class="auth-header">
            <h3 class="auth-title">
              <i class="fas fa-user auth-icon"></i>
              Thông tin đăng nhập
            </h3>
          </div>
          <div class="auth-form">
            <form @submit.prevent="handleLogin">
              <div class="form-group">
                <label class="field-label">Email:</label>
                <div class="input-wrapper">
                  <i class="fas fa-envelope input-icon"></i>
                  <input 
                    v-model="email" 
                    type="email" 
                    class="modern-input"
                    required 
                    :disabled="isLoading"
                    placeholder="admin@example.com hoặc user@example.com"
                  />
                </div>
              </div>
              <div class="form-group">
                <label class="field-label">Mật khẩu:</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock input-icon"></i>
                  <input 
                    v-model="password" 
                    type="password" 
                    class="modern-input"
                    required 
                    :disabled="isLoading"
                    placeholder="password"
                  />
                </div>
              </div>
              <button type="submit" :disabled="isLoading" class="auth-btn primary">
                <i class="fas fa-sign-in-alt" v-if="!isLoading"></i>
                <i class="fas fa-spinner fa-spin" v-if="isLoading"></i>
                <span v-if="isLoading">Đang đăng nhập...</span>
                <span v-else>Đăng nhập</span>
              </button>
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            </form>
          </div>
        </div>
        
        <!-- Demo Accounts -->
        <div class="demo-card">
          <div class="demo-header">
            <h4 class="demo-title">
              <i class="fas fa-info-circle"></i>
              Tài khoản demo
            </h4>
          </div>
          <div class="demo-content">
            <div class="demo-account">
              <span class="demo-role admin">Admin</span>
              <span class="demo-credentials">admin@example.com / password</span>
            </div>
            <div class="demo-account">
              <span class="demo-role user">User</span>
              <span class="demo-credentials">user@example.com / password</span>
            </div>
          </div>
        </div>
        
        <!-- Register Link -->
        <div class="auth-footer">
          <p class="auth-link-text">Chưa có tài khoản?</p>
          <router-link to="/register" class="auth-link">
            <i class="fas fa-user-plus"></i>
            Đăng ký ngay
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '../services/auth.js';
import { createToast } from '../utils/helpers.js';

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  mounted() {
    // Nếu user đã đăng nhập, redirect về trang chủ
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    if (user && token) {
      this.$router.push('/');
    }
  },
  methods: {
    async handleLogin() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      this.errorMessage = "";
      
      try {
        const response = await AuthService.login({
          email: this.email,
          password: this.password
        });
        
        if (response.success) {
          // Thông báo thành công
          createToast('success', `Chào mừng ${response.user.name}!`);
          
          // Emit login success - App.vue sẽ xử lý redirect
          this.$emit("login-success", response.user);
        } else {
          this.errorMessage = response.message || "Đăng nhập thất bại";
          createToast('error', 'Đăng nhập thất bại!');
        }
        
      } catch (err) {
        this.errorMessage = "Email hoặc mật khẩu không đúng";
        createToast('error', 'Email hoặc mật khẩu không đúng!');
        console.error("Login Error:", err);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Auth Page Layout */
.auth-page {
  min-height: calc(100vh - 80px);
}

/* Logo Section */
.logo-section {
  background: white;
  padding: var(--spacing-xl) 0;
  border-bottom: 1px solid var(--border-light);
}

.logo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  text-align: center;
}

.digital-library-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2563eb;
  margin: 0;
  text-align: center;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* Auth Section */
.auth-section {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* Auth Card - Modern gradient background */
.auth-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.auth-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #000000;
  display: flex;
  align-items: center;
  margin: 0;
}

.auth-icon {
  color: var(--primary-color);
  margin-right: var(--spacing-sm);
}

.auth-form {
  padding: var(--spacing-xl);
}

/* Form Styles - Same as Homepage */
.form-group {
  margin-bottom: var(--spacing-lg);
}

.field-label {
  display: block;
  margin-bottom: var(--spacing-sm);
  font-weight: 500;
  color: #000000;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #000000;
  font-size: 1rem;
  pointer-events: none;
}

.modern-input {
  width: 100%;
  padding: 1rem 1rem 1rem 2.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
  color: #1f2937;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.modern-input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
  transform: translateY(-1px);
}

.modern-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--bg-secondary);
}

.modern-input::placeholder {
  color: #666666;
  font-weight: 400;
}

/* Auth Button - Modern Theme */
.auth-btn {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: var(--spacing-md);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
}

.auth-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.auth-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4);
}

.auth-btn:hover:not(:disabled)::before {
  left: 100%;
}

.auth-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  background: #9ca3af;
  box-shadow: none;
}

.auth-btn:disabled::before {
  display: none;
}

/* Error Message */
.error-message {
  color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  margin-top: var(--spacing-md);
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
  font-size: 0.875rem;
}

/* Demo Card */
.demo-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.demo-header {
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.demo-title {
  font-size: 1rem;
  font-weight: 600;
  color: #000000;
  display: flex;
  align-items: center;
  margin: 0;
}

.demo-title i {
  color: var(--info-color);
  margin-right: var(--spacing-sm);
}

.demo-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.demo-account {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.demo-role {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.demo-role.admin {
  background: var(--error-color);
  color: white;
}

.demo-role.user {
  background: var(--success-color);
  color: white;
}

.demo-credentials {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: monospace;
}

/* Auth Footer */
.auth-footer {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.auth-link-text {
  color: #000000;
  margin: 0;
  font-size: 0.875rem;
}

.auth-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.1);
}

.auth-link:hover {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .auth-section {
    margin: 0 var(--spacing-md);
  }
  
  .demo-account {
    flex-direction: column;
    gap: var(--spacing-xs);
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-section {
    padding: var(--spacing-xl) 0;
  }
  
  .auth-header,
  .auth-form,
  .demo-content {
    padding: var(--spacing-md);
  }
}
</style>
