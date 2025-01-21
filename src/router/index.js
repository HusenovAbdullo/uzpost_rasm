import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/Login.vue'; // Login sahifasining to'g'ri yo'li
import DashboardPage from '../views/Dashboard.vue'; // Dashboard sahifasining to'g'ri yo'li
import StatistikaVue from '@/views/Statistika.vue';
import Dashboard1Vue from '@/views/Dashboard1.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage, // Login sahifasiga yo'naltirish
  },
  {
    path: '/dashboard/:fish?', // F.I.SH uchun parametr
    name: 'Dashboard',
    component: DashboardPage,
    props: true, // URL parametrlarini komponentga uzatish
  },
  {
    path: '/dashboard/:region', // Viloyat uchun parametr
    name: 'DashboardRegion',
    component: DashboardPage,
    props: true,
  },
  {
    path: '/dashboard/:region/:district', // Viloyat va tuman uchun parametr
    name: 'DashboardRegionDistrict',
    component: DashboardPage,
    props: true,
  },
  {
    path: '/statistika',
    name: 'Statistika',
    component: StatistikaVue, // Dashboard sahifasiga yo'naltirish
  },
  {
    path: '/dashboard1/:fish?/:region?/:district?',
    name: 'Dashboard1',
    component: Dashboard1Vue,
    props: true, // Parametrlarni komponentga o'tkazish
  }
  
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
