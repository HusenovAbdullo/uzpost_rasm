import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/Login.vue';
import DashboardPage from '../views/Dashboard.vue';
import StatistikaVue from '@/views/Statistika.vue';
import Statistika1Vue from '@/views/Statistika1.vue';
import Statistika2Vue from '@/views/Statistika2.vue';
import Dashboard1Vue from '@/views/Dashboard1.vue';

// JWT exp ni tekshirish uchun oddiy helper
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  if (!token) return true;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  // 5 soniyalik "buffer" bilan: muddati tugayotgan bo‘lsa ham logout
  const nowMs = Date.now();
  const expMs = payload.exp * 1000;
  return nowMs >= (expMs - 5000);
}

const routes = [
  { path: '/', name: 'Login', component: LoginPage },

  // Dashboard — hammasi himoyalangan (requiresAuth)
  { path: '/dashboard/:region', name: 'DashboardRegion', component: DashboardPage, props: true, meta: { requiresAuth: true } },
  { path: '/dashboard/:region/:district?', name: 'DashboardRegionDistrict', component: DashboardPage, props: true, meta: { requiresAuth: true } },
  { path: '/dashboard/:region/:district/:fish?', name: 'Dashboard', component: DashboardPage, props: true, meta: { requiresAuth: true } },
  { path: '/dashboard', name: 'Dashboarda', component: DashboardPage, props: true, meta: { requiresAuth: true } },

  // Statistika ham himoyalangan
  { path: '/statistika', name: 'Statistika', component: StatistikaVue, meta: { requiresAuth: true } },

  { path: '/statistika1', name: 'Statistika1', component: Statistika1Vue, meta: { requiresAuth: true } },

  { path: '/statistika2', name: 'Statistika2', component: Statistika2Vue, meta: { requiresAuth: true } },

  // Qo‘shimcha ko‘rinish
  { path: '/dashboard1/:fish?/:region?/:district?', name: 'Dashboard1', component: Dashboard1Vue, props: true, meta: { requiresAuth: true } },
];

const router = createRouter({
  // Agar Vite ishlatayotgan bo‘lsangiz, quyidagini yozing:
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Kirishdan oldin tokenni tekshiradigan guard
router.beforeEach((to) => {
  if (!to.meta?.requiresAuth) return true; // Login va boshqa ochiq yo‘llar
  const token = localStorage.getItem('token');
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    return { name: 'Login', replace: true };
  }
  return true;
});

// Ixtiyoriy: shu faylning o‘zida yengil "watcher"
// Tab'ga qaytganda va har 30s da token muddati o‘tgan bo‘lsa, Login’ga qaytaradi
if (typeof window !== 'undefined') {
  setInterval(() => {
    const t = localStorage.getItem('token');
    if (t && isTokenExpired(t)) {
      localStorage.removeItem('token');
      if (router.currentRoute.value.name !== 'Login') {
        router.replace({ name: 'Login' });
      }
    }
  }, 30000);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      const t = localStorage.getItem('token');
      if (t && isTokenExpired(t)) {
        localStorage.removeItem('token');
        if (router.currentRoute.value.name !== 'Login') {
          router.replace({ name: 'Login' });
        }
      }
    }
  });
}

export default router;
