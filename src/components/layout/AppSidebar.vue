<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/appStore';

const route = useRoute();
const appStore = useAppStore();

const navItems = computed(() => [
  { path: '/dashboard', label: appStore.t('nav.dashboard'), icon: 'space_dashboard' },
  { path: '/exploitation', label: appStore.t('nav.farm'), icon: 'landscape' },
  { path: '/climat', label: appStore.t('nav.climate'), icon: 'satellite_alt' },
  { path: '/cultures', label: appStore.t('nav.crops'), icon: 'psychiatry' },
  { path: '/scenarios', label: appStore.t('nav.scenarios'), icon: 'autorenew' },
  { path: '/decision', label: appStore.t('nav.decision'), icon: 'balance' },
  { path: '/sources', label: appStore.t('nav.sources'), icon: 'radar' },
  { path: '/profil', label: appStore.t('nav.profile'), icon: 'tune' },
]);

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
        <span class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">{{ appStore.t('app.name') }}</span>
        <span class="font-caption text-[11px] text-on-surface-variant leading-none">{{ appStore.t('app.subtitle') }}</span>
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
          <p class="font-label-md text-label-md text-on-surface leading-tight">{{ appStore.t('app.offlineActive') }}</p>
          <p class="font-caption text-caption text-on-surface-variant mt-0.5">{{ appStore.t('app.offlineDesc') }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between px-1 text-on-surface-variant font-label-md text-label-md">
        <!-- Lang switcher -->
        <button
          type="button"
          class="flex items-center gap-1.5 bg-surface-container-high px-3 py-1.5 rounded-full text-on-surface cursor-pointer hover:bg-surface-variant transition-colors border border-outline-variant/30"
          @click="appStore.toggleLanguage"
          :title="appStore.t('app.switchLang')"
        >
          <span class="material-symbols-outlined text-[16px] text-primary">translate</span>
          <span :class="appStore.language === 'en' ? 'font-body-bold text-primary' : 'opacity-60'">EN</span>
          <span class="opacity-40">/</span>
          <span :class="appStore.language === 'fr' ? 'font-body-bold text-primary' : 'opacity-60'">FR</span>
        </button>

        <!-- Currency badge -->
        <span class="font-body-bold text-label-md text-primary bg-primary-fixed px-3 py-1 rounded-full">
          {{ appStore.currency }} (XAF)
        </span>
      </div>
    </div>
  </aside>
</template>
