<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';

const router = useRouter();
const farmStore = useFarmStore();
const auth = useAuthStore();
const appStore = useAppStore();
const tr = appStore.tr;

const plotMenuOpen = ref(false);
const userMenuOpen = ref(false);

const selectPlot = (id: string) => {
  farmStore.setActivePlot(id);
  plotMenuOpen.value = false;
};

const signOut = () => {
  userMenuOpen.value = false;
  auth.logout();
  farmStore.reset();
  router.push('/login');
};

const closeOnOutsideClick = (e: MouseEvent) => {
  if (!(e.target as HTMLElement)?.closest?.('[data-menu-root]')) {
    plotMenuOpen.value = false;
    userMenuOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', closeOnOutsideClick));
onBeforeUnmount(() => document.removeEventListener('click', closeOnOutsideClick));

const initials = computed(() =>
  (auth.displayName || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AG',
);

const regionLabel = computed(() =>
  farmStore.activePlot?.coordinates.region || appStore.t(appStore.regionKey),
);

const plotLabel = computed(() => {
  const plot = farmStore.activePlot;
  if (!plot) return tr('No plot yet', 'Aucune parcelle');
  return `${plot.coordinates.locality} • ${plot.surfaceHa} ha`;
});
</script>

<template>
  <header
    class="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-outline-variant/15"
  >
    <!-- Left: active plot selector -->
    <div class="flex items-center gap-3 flex-1 max-w-xl">
      <div class="relative" data-menu-root>
        <button
          type="button"
          class="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.02)] min-h-[44px] cursor-pointer hover:bg-surface-container-low transition-colors"
          @click="plotMenuOpen = !plotMenuOpen"
        >
          <span class="material-symbols-outlined text-primary text-[20px]">pin_drop</span>
          <div class="text-left">
            <p class="font-label-md text-label-md text-on-surface-variant leading-none">{{ appStore.t('app.activePlot') }}</p>
            <p class="font-body-bold text-label-lg text-on-surface leading-tight">{{ plotLabel }}</p>
          </div>
          <span class="material-symbols-outlined text-on-surface-variant text-[18px] ml-1">expand_more</span>
        </button>

        <div
          v-if="plotMenuOpen"
          class="absolute left-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-1 z-50"
        >
          <button
            v-for="plot in farmStore.plots"
            :key="plot.id"
            type="button"
            class="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface-container-low transition-colors cursor-pointer min-h-[40px]"
            :class="farmStore.activePlot?.id === plot.id ? 'text-primary font-bold' : 'text-on-surface'"
            @click="selectPlot(plot.id)"
          >
            <span class="flex flex-col min-w-0">
              <span class="font-body-bold text-caption truncate">{{ plot.name }}</span>
              <span class="font-caption text-[11px] text-on-surface-variant">
                {{ plot.code }} • {{ plot.surfaceHa }} ha
              </span>
            </span>
            <span v-if="farmStore.activePlot?.id === plot.id" class="material-symbols-outlined text-primary text-[16px]">check</span>
          </button>

          <RouterLink
            to="/exploitation"
            class="w-full flex items-center gap-2 px-3 py-2 font-caption text-caption text-primary hover:bg-surface-container-low border-t border-outline-variant/20 min-h-[40px]"
            @click="plotMenuOpen = false"
          >
            <span class="material-symbols-outlined text-[16px]">add</span>
            {{ tr('Manage my plots', 'Gérer mes parcelles') }}
          </RouterLink>
        </div>
      </div>

      <div class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-tertiary font-label-md text-label-md">
        <span class="material-symbols-outlined text-[16px]">public</span>
        <span>NASA POWER</span>
      </div>
    </div>

    <!-- Right: language, region, account -->
    <div class="flex items-center gap-2.5 sm:gap-3">
      <button
        type="button"
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-md text-label-md transition-all shadow-xs active:scale-95 cursor-pointer min-h-[38px]"
        :title="appStore.t('app.switchLang')"
        @click="appStore.toggleLanguage"
      >
        <span class="material-symbols-outlined text-primary text-[18px]">translate</span>
        <span class="flex items-center gap-1 font-mono font-bold text-[13px]">
          <span :class="appStore.language === 'en' ? 'text-primary bg-primary/10 px-1.5 py-0.5 rounded-md' : 'text-on-surface-variant opacity-70'">EN</span>
          <span class="text-outline text-[11px]">|</span>
          <span :class="appStore.language === 'fr' ? 'text-primary bg-primary/10 px-1.5 py-0.5 rounded-md' : 'text-on-surface-variant opacity-70'">FR</span>
        </span>
      </button>

      <div
        class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high border border-outline-variant/30 text-on-surface font-caption text-caption min-h-[34px]"
        :title="tr('Region of the active plot', 'Région de la parcelle active')"
      >
        <span class="material-symbols-outlined text-primary text-[14px]">location_on</span>
        <span class="font-body-bold text-primary">{{ regionLabel }}</span>
      </div>

      <div class="relative" data-menu-root>
        <button
          type="button"
          class="flex items-center gap-2 pl-1 cursor-pointer hover:opacity-90 transition-opacity"
          @click="userMenuOpen = !userMenuOpen"
        >
          <span class="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-body-bold text-label-md shadow-sm ring-2 ring-primary/20">
            {{ initials }}
          </span>
          <div class="hidden md:block text-left">
            <p class="font-body-bold text-label-lg text-on-surface leading-none">{{ auth.displayName }}</p>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5 leading-none">{{ auth.user?.email }}</p>
          </div>
        </button>

        <div
          v-if="userMenuOpen"
          class="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-1 z-50"
        >
          <RouterLink
            to="/profil"
            class="flex items-center gap-2 px-3 py-2 font-body-md text-caption text-on-surface hover:bg-surface-container-low min-h-[40px]"
            @click="userMenuOpen = false"
          >
            <span class="material-symbols-outlined text-[18px] text-primary">person</span>
            {{ appStore.t('nav.profile') }}
          </RouterLink>
          <RouterLink
            to="/sources"
            class="flex items-center gap-2 px-3 py-2 font-body-md text-caption text-on-surface hover:bg-surface-container-low min-h-[40px]"
            @click="userMenuOpen = false"
          >
            <span class="material-symbols-outlined text-[18px] text-primary">database</span>
            {{ appStore.t('nav.sources') }}
          </RouterLink>
          <button
            type="button"
            class="w-full flex items-center gap-2 px-3 py-2 font-body-md text-caption text-error hover:bg-error-container/20 border-t border-outline-variant/20 min-h-[40px] cursor-pointer"
            @click="signOut"
          >
            <span class="material-symbols-outlined text-[18px]">logout</span>
            {{ tr('Sign out', 'Se déconnecter') }}
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
