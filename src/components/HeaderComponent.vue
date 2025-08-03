<template>
  <nav class="navbar navbar-expand-lg navbar-light header-gradient sticky-top shadow-custom">
    <div class="container-fluid">
      <!-- Brand -->
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <i class="fas fa-book me-2 text-primary"></i>
        <span class="fw-bold text-primary">
          {{ translations[currentLanguage]?.digitalLibrary || "Library" }}
        </span>
      </router-link>

      <!-- Mobile Toggle Button -->
      <button 
        class="navbar-toggler border-0" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav" 
        aria-controls="navbarNav" 
        aria-expanded="false" 
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Collapsible Content -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Navigation Links -->
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center"
              :class="{ active: currentView === 'home' }"
              to="/"
            >
              <i class="fas fa-home me-1"></i>
              {{ translations[currentLanguage]?.home || "Home" }}
            </router-link>
          </li>

          <li v-if="currentUser" class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center"
              :class="{ active: currentView === 'favorites' }"
              to="/favorites"
            >
              <i class="fas fa-heart me-1"></i>
              {{ translations[currentLanguage]?.favorites || "Favorites" }}
            </router-link>
          </li>

          <li v-if="currentUser" class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center"
              :class="{ active: currentView === 'history' }"
              to="/history"
            >
              <i class="fas fa-history me-1"></i>
              {{ translations[currentLanguage]?.history || "History" }}
            </router-link>
          </li>

          <li v-if="currentUser && currentUser.role === 'admin'" class="nav-item">
            <router-link
              class="nav-link d-flex align-items-center"
              :class="{ active: currentView === 'admin' }"
              to="/admin"
            >
              <i class="fas fa-cog me-1"></i>
              {{ translations[currentLanguage]?.admin || "Admin" }}
            </router-link>
          </li>
        </ul>

        <!-- Right Side Actions -->
        <div class="d-flex align-items-center gap-3">
          <!-- Language Switcher -->
          <div class="btn-group" role="group" aria-label="Language switcher">
            <button
              type="button"
              class="btn btn-sm"
              :class="currentLanguage === 'vi' ? 'btn-primary' : 'btn-outline-primary'"
              @click="$emit('change-language', 'vi')"
            >
              VI
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="currentLanguage === 'en' ? 'btn-primary' : 'btn-outline-primary'"
              @click="$emit('change-language', 'en')"
            >
              EN
            </button>
          </div>

          <!-- User Menu (Logged In) -->
          <div v-if="currentUser" class="dropdown">
            <button 
              class="btn btn-outline-primary dropdown-toggle d-flex align-items-center" 
              type="button" 
              id="userDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <i class="fas fa-user me-1"></i>
              <span class="d-none d-md-inline">{{ currentUser.name }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <router-link class="dropdown-item d-flex align-items-center" to="/profile">
                  <i class="fas fa-user-circle me-2"></i>
                  {{ translations[currentLanguage]?.profile || "Profile" }}
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item d-flex align-items-center text-danger" @click="$emit('logout')">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  {{ translations[currentLanguage]?.logout || "Logout" }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Auth Buttons (Not Logged In) -->
          <div v-else class="d-flex gap-2">
            <router-link class="btn btn-outline-primary btn-sm d-flex align-items-center" to="/login">
              <i class="fas fa-sign-in-alt me-1"></i>
              <span class="d-none d-sm-inline">{{ translations[currentLanguage]?.login || "Login" }}</span>
            </router-link>
            <router-link class="btn btn-primary btn-sm d-flex align-items-center" to="/register">
              <i class="fas fa-user-plus me-1"></i>
              <span class="d-none d-sm-inline">{{ translations[currentLanguage]?.register || "Register" }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "HeaderComponent",
  props: {
    currentUser: Object,
    currentView: String,
    currentLanguage: String,
    translations: Object,
  },
  emits: ["change-language", "logout"],
};
</script>

<style scoped>
/* Custom styles for Bootstrap navbar integration */

/* Header gradient background */
.header-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.header-gradient:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
}

/* Enhanced shadow */
.shadow-custom {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Navbar brand customization */
.navbar-brand {
  font-size: 1.5rem;
  text-decoration: none !important;
  transition: all 0.2s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

/* Navigation links */
.nav-link {
  font-weight: 500;
  transition: all 0.2s ease;
  border-radius: var(--radius-md);
  margin: 0 0.25rem;
  color: var(--text-secondary) !important;
}

.nav-link:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary) !important;
  transform: translateY(-1px);
}

.nav-link.active {
  background: var(--primary-color) !important;
  color: white !important;
  font-weight: 600;
}

/* Dropdown customizations */
.dropdown-toggle::after {
  margin-left: 0.5rem;
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
  border-radius: var(--radius-md);
  margin: 0 0.5rem;
  width: calc(100% - 1rem);
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  transform: translateX(4px);
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-color: var(--border-light);
}

/* Button group for language switcher */
.btn-group .btn {
  border-radius: 0;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
}

.btn-group .btn:first-child {
  border-radius: var(--radius-md) 0 0 var(--radius-md);
}

.btn-group .btn:last-child {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

/* Mobile responsive adjustments */
@media (max-width: 991.98px) {
  .navbar-nav {
    padding: 1rem 0;
  }
  
  .nav-link {
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
    gap: 1rem !important;
    align-items: stretch !important;
    padding: 1rem 0;
  }
  
  .btn-group {
    justify-content: center;
  }
  
  .dropdown {
    width: 100%;
  }
  
  .dropdown .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 575.98px) {
  .navbar-brand {
    font-size: 1.25rem;
  }
  
  .d-none.d-sm-inline {
    display: inline !important;
  }
}

/* Custom animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.navbar-collapse.show {
  animation: fadeInDown 0.3s ease;
}

/* Accessibility improvements */
.navbar-toggler:focus {
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

.btn:focus,
.dropdown-toggle:focus {
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

/* Custom gap utility for older Bootstrap versions */
.gap-3 {
  gap: 1rem;
}

.gap-2 {
  gap: 0.5rem;
}

/* Ensure proper text color inheritance */
.text-danger {
  color: var(--error-color) !important;
}

/* Smooth transitions for all interactive elements */
.btn,
.nav-link,
.dropdown-item,
.navbar-brand {
  transition: all 0.2s ease;
}
</style>
