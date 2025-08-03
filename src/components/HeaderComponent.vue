<template>
  <header class="simple-header">
    <div class="header-container">
      <!-- Logo -->
      <router-link class="logo" to="/">
        <i class="fas fa-book"></i>
        <span>{{ translations[currentLanguage]?.digitalLibrary || "Digital Library" }}</span>
      </router-link>

      <!-- Desktop Navigation -->
      <nav class="nav-menu desktop-only">
        <router-link class="nav-item" to="/">
          {{ translations[currentLanguage]?.home || "Home" }}
        </router-link>
        <router-link 
          v-if="currentUser"
          class="nav-item" 
          to="/favorites"
        >
          {{ translations[currentLanguage]?.favorites || "Favorites" }}
        </router-link>
        <router-link 
          v-if="currentUser"
          class="nav-item" 
          to="/history"
        >
          {{ translations[currentLanguage]?.history || "History" }}
        </router-link>
        <router-link 
          v-if="currentUser && currentUser.role === 'admin'"
          class="nav-item" 
          to="/admin"
        >
          {{ translations[currentLanguage]?.admin || "Admin" }}
        </router-link>
      </nav>

      <!-- Right Side -->
      <div class="header-actions">
        <!-- Language Switcher -->
        <div class="language-switch">
          <button
            class="lang-btn"
            :class="{ active: currentLanguage === 'vi' }"
            @click="$emit('change-language', 'vi')"
          >
            VI
          </button>
          <button
            class="lang-btn"
            :class="{ active: currentLanguage === 'en' }"
            @click="$emit('change-language', 'en')"
          >
            EN
          </button>
        </div>

        <!-- User Menu or Auth Buttons -->
        <div v-if="currentUser" class="user-section">
          <div class="dropdown" @click="toggleUserMenu">
            <button class="user-btn" :class="{ active: userMenuOpen }">
              <i class="fas fa-user"></i>
              {{ currentUser.name }}
              <i class="fas fa-chevron-down" :class="{ rotated: userMenuOpen }"></i>
            </button>
            <ul class="dropdown-menu" :class="{ show: userMenuOpen }">
              <li>
                <router-link class="dropdown-item" to="/profile" @click="closeUserMenu">
                  <i class="fas fa-user-cog"></i>
                  {{ translations[currentLanguage]?.profile || "Profile" }}
                </router-link>
              </li>
              <li>
                <button class="dropdown-item" @click="handleLogout">
                  <i class="fas fa-sign-out-alt"></i>
                  {{ translations[currentLanguage]?.logout || "Logout" }}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div v-else class="auth-section">
          <router-link class="btn-login" to="/login">
            {{ translations[currentLanguage]?.login || "Login" }}
          </router-link>
          <router-link class="btn-register" to="/register">
            {{ translations[currentLanguage]?.register || "Register" }}
          </router-link>
        </div>

        <!-- Mobile Menu Toggle -->
        <button class="mobile-toggle mobile-only" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div class="mobile-nav" :class="{ open: mobileMenuOpen }">
      <router-link class="mobile-nav-item" to="/" @click="closeMobileMenu">
        {{ translations[currentLanguage]?.home || "Home" }}
      </router-link>
      <router-link 
        v-if="currentUser"
        class="mobile-nav-item" 
        to="/favorites" 
        @click="closeMobileMenu"
      >
        {{ translations[currentLanguage]?.favorites || "Favorites" }}
      </router-link>
      <router-link 
        v-if="currentUser"
        class="mobile-nav-item" 
        to="/history" 
        @click="closeMobileMenu"
      >
        {{ translations[currentLanguage]?.history || "History" }}
      </router-link>
      <router-link 
        v-if="currentUser && currentUser.role === 'admin'"
        class="mobile-nav-item" 
        to="/admin"
        @click="closeMobileMenu"
      >
        {{ translations[currentLanguage]?.admin || "Admin" }}
      </router-link>
    </div>
  </header>
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
  data() {
    return {
      mobileMenuOpen: false,
      userMenuOpen: false,
    };
  },
  methods: {
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false;
    },
    toggleUserMenu(event) {
      event.stopPropagation();
      this.userMenuOpen = !this.userMenuOpen;
    },
    closeUserMenu() {
      this.userMenuOpen = false;
    },
    handleLogout() {
      this.closeUserMenu();
      this.$emit('logout');
    },
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.closeUserMenu();
        this.closeMobileMenu();
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
};
</script>

<style scoped>
/* Simple Header Styles */
.simple-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.logo i {
  font-size: 1.2rem;
}

.logo:hover {
  color: #f0f0f0;
}

/* Desktop Navigation */
.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: white;
}

.nav-item[href="/"] {
  color: white;
}

.nav-item[href="/"]:hover {
  color: #f0f0f0;
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Language Switcher */
.language-switch {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
}

.lang-btn {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.lang-btn:hover {
  background: var(--bg-secondary);
}

.lang-btn.active {
  background: var(--primary-color);
  color: white;
}

/* User Section */
.user-section {
  position: relative;
}

.user-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.user-btn:hover,
.user-btn.active {
  background: var(--bg-secondary);
  border-color: var(--primary-color);
}

.user-btn .fa-chevron-down {
  transition: transform 0.2s ease;
  font-size: 0.7rem;
}

.user-btn .fa-chevron-down.rotated {
  transform: rotate(180deg);
}

/* Auth Buttons */
.auth-section {
  display: flex;
  gap: 0.5rem;
}

.btn-login,
.btn-register {
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-login {
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-login:hover {
  background: var(--bg-secondary);
}

.btn-register {
  background: var(--primary-color);
  color: white;
}

.btn-register:hover {
  background: var(--primary-dark);
}

/* Mobile Toggle */
.mobile-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--text-primary);
  cursor: pointer;
}

/* Mobile Navigation */
.mobile-nav {
  display: none;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 1rem;
}

.mobile-nav.open {
  display: block;
}

.mobile-nav-item {
  display: block;
  text-decoration: none;
  color: var(--text-secondary);
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.mobile-nav-item:hover,
.mobile-nav-item.router-link-active {
  color: white;
}

.mobile-nav-item[href="/"] {
  color: white;
}

.mobile-nav-item[href="/"]:hover {
  color: #f0f0f0;
}

.mobile-nav-item:last-child {
  border-bottom: none;
}

/* Responsive */
.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
  
  .header-container {
    padding: 0 0.5rem;
  }
  
  .logo span {
    display: none;
  }
  
  .auth-section {
    display: none;
  }
}

/* Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 180px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 1000;
  margin-top: 0.5rem;
  list-style: none;
  padding: 0.5rem 0;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-primary);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--primary-color);
}

.dropdown-item i {
  font-size: 0.8rem;
  width: 16px;
}
</style>
