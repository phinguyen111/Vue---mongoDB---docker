import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import './styles/variables.css';
import './styles/base.css';
import './styles/bootstrap-integration.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/homepage-enhancements.css';

createApp(App).use(router).mount('#app');
