import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import './style.css';
import { useAuthStore } from './stores/auth';
import '@mdi/font/css/materialdesignicons.css'


// Create app instance
const app = createApp(App);

// Create Pinia instance
const pinia = createPinia();
app.use(pinia);

// Initialize auth store
const authStore = useAuthStore(pinia);
authStore.initializeAuth();

// Use plugins
app.use(router);
app.use(vuetify);

// Mount app
app.mount('#app');