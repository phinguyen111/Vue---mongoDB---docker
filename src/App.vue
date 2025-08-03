<template>
  <div id="app">
    <HeaderComponent
      v-if="!hideHeader"
      :current-user="currentUser"
      :current-language="currentLanguage"
      :translations="translations"
      @change-language="changeLanguage"
      @logout="logout"
    />
    <main class="main-content" :class="{ 'with-header': !hideHeader }">
      <router-view @login-success="handleLoginSuccess" />
    </main>
  </div>
</template>

<script>
import HeaderComponent from "@/components/HeaderComponent.vue";
import { translations } from "@/data/mockData.js";
import { useRoute } from "vue-router";

export default {
  name: "App",
  components: {
    HeaderComponent,
  },
  data() {
    return {
      currentUser: null,
      currentLanguage: "en",
      translations: translations,
    };
  },
  computed: {
    hideHeader() {
      const path = this.$route.path;
      return path === "/login" || path === "/register";
    },
  },
  methods: {
    changeLanguage(lang) {
      this.currentLanguage = lang;
      localStorage.setItem("language", lang);
    },
    logout() {
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      this.currentUser = null;
      this.$router.push("/");
    },
    handleLoginSuccess(user) {
      this.currentUser = user;
    },
  },
  mounted() {
  const user = localStorage.getItem('currentUser');
  if (user) {
    this.currentUser = JSON.parse(user);
  }

  const lang = localStorage.getItem('language');
  if (lang) {
    this.currentLanguage = lang;
  }
}

};
</script>

<style>
/* Main content styling */
.main-content {
  min-height: calc(100vh - 80px);
  transition: all 0.3s ease;
}

.main-content.with-header {
  padding-top: 2rem;
}

/* Ensure smooth transitions */
#app {
  background: inherit;
}

/* Enhanced container for better spacing */
.container, .container-fluid {
  position: relative;
}

/* Subtle animation for page transitions */
.router-view {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
