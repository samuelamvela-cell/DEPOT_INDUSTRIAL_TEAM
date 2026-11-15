<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/appStore';

const route = useRoute();
const appStore = useAppStore();

const navItems = computed(() => {
  const isFr = appStore.language === 'fr';
  return [
    { path: '/dashboard', label: isFr ? 'Accueil' : 'Home', icon: 'home' },
    { path: '/exploitation', label: isFr ? 'Ferme' : 'Farm', icon: 'landscape' },
    { path: '/scenarios', label: isFr ? 'Rotations' : 'Scenarios', icon: 'sync_alt' },
    { path: '/decision', label: isFr ? 'Décision' : 'Decision', icon: 'verified' },
    { path: '/profil', label: isFr ? 'Profil' : 'Profile', icon: 'account_circle' },
  ];
});

const isCurrent = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(27,42,34,0.08)] border-t border-outline-variant/20 pb-[max(env(safe-area-inset-bottom),4px)]"
  >
    <div class="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-col items-center justify-center py-1 transition-all select-none rounded-xl active:scale-95',
          isCurrent(item.path)
            ? 'text-primary font-bold'
            : 'text-on-surface-variant hover:text-on-surface opacity-75',
        ]"
      >
        <div
          :class="[
            'flex items-center justify-center w-10 h-7 rounded-full transition-colors',
            isCurrent(item.path) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'
          ]"
        >
          <span class="material-symbols-outlined text-[22px]">
            {{ item.icon }}
          </span>
        </div>
        <span class="text-[10px] leading-tight mt-0.5 truncate max-w-full px-0.5 text-center font-medium">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
