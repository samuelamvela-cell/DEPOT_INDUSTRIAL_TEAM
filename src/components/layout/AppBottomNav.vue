<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const navItems = [
  { path: '/dashboard', label: 'Accueil', icon: 'home' },
  { path: '/exploitation', label: 'Exploitation', icon: 'landscape' },
  { path: '/scenarios', label: 'Scénarios', icon: 'sync_alt' },
  { path: '/decision', label: 'Décision', icon: 'verified' },
  { path: '/profil', label: 'Profil', icon: 'account_circle' },
];

const isCurrent = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <nav
    class="lg:hidden fixed bottom-0 w-full z-50 pb-safe bg-surface/90 backdrop-blur-xl shadow-[0_-2px_12px_rgba(27,42,34,0.06)] border-t border-outline-variant/20"
  >
    <div class="flex items-center justify-around h-16 px-1">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="[
          'flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-1 transition-all select-none',
          isCurrent(item.path)
            ? 'text-primary font-body-bold'
            : 'text-on-surface-variant hover:text-on-surface',
        ]"
      >
        <span class="material-symbols-outlined text-[24px]">
          {{ item.icon }}
        </span>
        <span class="font-label-md text-[11px] mt-0.5">{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
