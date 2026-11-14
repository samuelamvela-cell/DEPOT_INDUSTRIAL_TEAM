import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { hideLayout: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
  },
  {
    path: '/exploitation',
    name: 'exploitation',
    component: () => import('@/views/FarmView.vue'),
  },
  {
    path: '/climat',
    name: 'climat',
    component: () => import('@/views/ClimateView.vue'),
  },
  {
    path: '/cultures',
    name: 'cultures',
    component: () => import('@/views/CropsView.vue'),
  },
  {
    path: '/scenarios',
    name: 'scenarios',
    component: () => import('@/views/ScenariosView.vue'),
  },
  {
    path: '/decision',
    name: 'decision',
    component: () => import('@/views/DecisionView.vue'),
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: () => import('@/views/ScenarioDetailView.vue'),
  },
  {
    path: '/sources',
    name: 'sources',
    component: () => import('@/views/SourcesView.vue'),
  },
  {
    path: '/profil',
    name: 'profil',
    component: () => import('@/views/ProfileView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
