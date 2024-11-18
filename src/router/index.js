import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/Login.vue'; // Login sahifasining to'g'ri yo'li
import DashboardPage from '../views/Dashboard.vue'; // Dashboard sahifasining to'g'ri yo'li

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage, // Login sahifasiga yo'naltirish
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage, // Dashboard sahifasiga yo'naltirish
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
