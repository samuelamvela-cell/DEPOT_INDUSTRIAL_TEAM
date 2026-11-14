<script setup lang="ts">
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';

const farmStore = useFarmStore();
const appStore = useAppStore();
</script>

<template>
  <header
    class="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-outline-variant/15"
  >
    <!-- Left: Selected Farm Selector & Satellite Pill -->
    <div class="flex items-center gap-3 flex-1 max-w-xl">
      <div
        class="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] min-h-[44px] cursor-pointer hover:bg-surface-container-low transition-colors"
      >
        <span class="material-symbols-outlined text-primary text-[20px]">pin_drop</span>
        <div class="text-left">
          <p class="font-label-md text-label-md text-on-surface-variant leading-none">{{ appStore.t('app.activePlot') }}</p>
          <p class="font-body-bold text-label-lg text-on-surface leading-tight">
            {{ farmStore.activePlot.coordinates.locality }} • {{ farmStore.activePlot.surfaceHa }} ha
          </p>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant text-[18px] ml-1">expand_more</span>
      </div>

      <!-- Satellite sync badge -->
      <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-tertiary font-label-md text-label-md">
        <span class="material-symbols-outlined text-[16px]">public</span>
        <span>NASA POWER &amp; IMERG</span>
      </div>
    </div>

    <!-- Right: Language Switcher, Notification & Profile -->
    <div class="flex items-center gap-2.5 sm:gap-3">
      <!-- SPONTANEOUS LANGUAGE SWITCHER BUTTON -->
      <button
        type="button"
        @click="appStore.toggleLanguage"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-md text-label-md transition-all shadow-xs active:scale-95 cursor-pointer min-h-[38px]"
        :title="appStore.t('app.switchLang')"
      >
        <span class="material-symbols-outlined text-primary text-[18px]">translate</span>
        <span class="flex items-center gap-1 font-mono font-bold text-[13px]">
          <span :class="appStore.language === 'en' ? 'text-primary bg-primary/10 px-1.5 py-0.5 rounded-md' : 'text-on-surface-variant opacity-70'">EN</span>
          <span class="text-outline text-[11px]">|</span>
          <span :class="appStore.language === 'fr' ? 'text-primary bg-primary/10 px-1.5 py-0.5 rounded-md' : 'text-on-surface-variant opacity-70'">FR</span>
        </span>
      </button>

      <!-- Offline indicator mobile -->
      <div
        class="hidden sm:flex lg:hidden items-center gap-1 bg-surface-container px-2 py-1 rounded-full text-primary font-caption text-caption"
        :title="appStore.t('app.syncReady')"
      >
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        <span class="font-medium">Sync</span>
      </div>

      <button
        class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative cursor-pointer"
        type="button"
        title="Notifications"
      >
        <span class="material-symbols-outlined text-[22px]">notifications</span>
        <span class="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary-container"></span>
      </button>

      <!-- Advisor profile chip -->
      <RouterLink
        to="/profil"
        class="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <img
          alt="Michel Ngoa"
          class="w-9 h-9 rounded-full object-cover shadow-sm ring-2 ring-primary/20"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
        />
        <div class="hidden md:block text-left">
          <p class="font-body-bold text-label-lg text-on-surface leading-none">{{ farmStore.user.name }}</p>
          <p class="font-caption text-caption text-on-surface-variant mt-0.5 leading-none">{{ appStore.t('app.advisorRole') }}</p>
        </div>
      </RouterLink>
    </div>
  </header>
</template>
