import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { hideLayout: true, guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { hideLayout: true, guestOnly: true },
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { hideLayout: true, requiresAuth: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/exploitation',
    name: 'exploitation',
    component: () => import('@/views/FarmView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/climat',
    name: 'climat',
    component: () => import('@/views/ClimateView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/cultures',
    name: 'cultures',
    component: () => import('@/views/CropsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/scenarios',
    name: 'scenarios',
    component: () => import('@/views/ScenariosView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/decision',
    name: 'decision',
    component: () => import('@/views/DecisionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('@/views/ScenarioDetailView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sources',
    name: 'sources',
    component: () => import('@/views/SourcesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profil',
    name: 'profil',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.bootstrap();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }
  return true;
});

export default router;
