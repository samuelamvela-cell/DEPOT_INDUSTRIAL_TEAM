<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/appStore';

const route = useRoute();
const appStore = useAppStore();

const navItems = [
  { path: '/dashboard', label: 'Accueil', icon: 'space_dashboard' },
  { path: '/exploitation', label: 'Mon Exploitation', icon: 'landscape' },
  { path: '/climat', label: 'Analyse Climatique', icon: 'satellite_alt' },
  { path: '/cultures', label: 'Bibliothèque Cultures', icon: 'psychiatry' },
  { path: '/scenarios', label: 'Scénarios de Rotation', icon: 'autorenew' },
  { path: '/decision', label: 'Comparaison & Décision', icon: 'balance' },
  { path: '/sources', label: 'Données & Sources', icon: 'radar' },
  { path: '/profil', label: 'Profil & Paramètres', icon: 'tune' },
];

const isCurrent = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <aside
    class="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex-col shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
  >
    <!-- Brand Header -->
    <RouterLink
      to="/dashboard"
      class="h-16 px-6 flex items-center gap-3 bg-surface-container-lowest border-b border-outline-variant/20 hover:opacity-90"
    >
      <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
        <span class="material-symbols-outlined text-[24px]">psychiatry</span>
      </div>
      <div class="flex flex-col">
        <span class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">AgroPredict</span>
        <span class="font-caption text-[11px] text-on-surface-variant leading-none">NASA Earth × IRAD Cameroun</span>
      </div>
    </RouterLink>

    <!-- Nav Items -->
    <nav class="flex-1 px-3 py-3 overflow-y-auto space-y-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all min-h-[48px] select-none',
          isCurrent(item.path)
            ? 'bg-primary-container text-on-primary font-body-bold rounded-xl shadow-sm'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-body-md',
        ]"
      >
        <span class="material-symbols-outlined text-[22px]">
          {{ item.icon }}
        </span>
        <span class="font-body-md text-body-md">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Footer Controls: Offline status & Lang/Currency toggles -->
    <div class="p-4 bg-surface-container-low/60 space-y-3 border-t border-outline-variant/20">
      <div class="bg-surface-container-lowest p-3 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-start gap-2">
        <span class="material-symbols-outlined text-primary text-[18px] mt-0.5">cloud_sync</span>
        <div class="flex-1">
          <p class="font-label-md text-label-md text-on-surface leading-tight">Mode Hors-ligne actif</p>
          <p class="font-caption text-caption text-on-surface-variant mt-0.5">Données NASA actualisées</p>
        </div>
      </div>

      <div class="flex items-center justify-between px-1 text-on-surface-variant font-label-md text-label-md">
        <!-- Lang switcher -->
        <button
          type="button"
          class="flex items-center gap-1 bg-surface-container-high px-3 py-1 rounded-full text-on-surface cursor-pointer hover:bg-surface-variant transition-colors"
          @click="appStore.toggleLanguage"
        >
          <span :class="appStore.language === 'fr' ? 'font-body-bold text-primary' : 'opacity-60'">FR</span>
          <span class="opacity-40">/</span>
          <span :class="appStore.language === 'en' ? 'font-body-bold text-primary' : 'opacity-60'">EN</span>
        </button>

        <!-- Currency badge -->
        <span class="font-body-bold text-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full">
          {{ appStore.currency }} (XAF)
        </span>
      </div>
    </div>
  </aside>
</template>
