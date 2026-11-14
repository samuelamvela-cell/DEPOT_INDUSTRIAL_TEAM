<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/appStore';
import AppButton from '@/components/common/AppButton.vue';
import AppBadge from '@/components/common/AppBadge.vue';

const router = useRouter();
const appStore = useAppStore();
const currentSlide = ref(0);

const slides = computed(() => {
  const isEn = appStore.language === 'en';
  return [
    {
      title: isEn ? 'Precision Satellite Data' : 'Données Satellite Précises',
      category: isEn ? 'Pillar 1 • Telemetry' : 'Pilier 1 • Télémesure',
      icon: 'satellite_alt',
      description: isEn
        ? "Direct observations of soil moisture, upcoming rainfall (NASA IMERG) and crop vigor without purchasing expensive physical sensors."
        : "Observation directe de l'humidité de vos sols, de la pluie imminente (NASA IMERG) et de la vigueur végétale sans acheter aucun capteur physique coûteux.",
      metrics: [
        { label: isEn ? 'Forecasted Rain' : 'Précipitation estimée', value: '+42 mm / decade' },
        { label: isEn ? 'Root Moisture' : 'Humidité racinaire', value: isEn ? 'Optimal for seeding' : 'Idéale semis' },
      ],
    },
    {
      title: isEn ? 'Rotation Simulator' : 'Simulateur de Rotations',
      category: isEn ? 'Pillar 2 • Planning' : 'Pilier 2 • Planification',
      icon: 'autorenew',
      description: isEn
        ? "Simulate successions of key staple crops (Maize, Cassava, Groundnut, Cowpea) across 3 seasons before committing seeds and inputs."
        : "Testez l'enchaînement de vos cultures vivrières phares (Maïs, Manioc, Arachide, Niébé) sur 3 saisons avant d'engager vos semences et intrants.",
      metrics: [
        { label: isEn ? 'Recommended Sequence' : 'Succession recommandée', value: isEn ? 'Maize → Cowpea' : 'Maïs → Niébé' },
        { label: isEn ? 'Symbiotic Fixation' : 'Fixation symbiotique', value: '+45 kg N/ha' },
      ],
    },
    {
      title: isEn ? 'Profitability in FCFA' : 'Rentabilité en FCFA',
      category: isEn ? 'Pillar 3 • Economics' : 'Pilier 3 • Économie',
      icon: 'payments',
      description: isEn
        ? "Estimate gross and net margins per hectare based on wholesale spot prices in Yaoundé and Obala markets."
        : "Estimez vos marges brutes et nettes à l'hectare selon les cours réels sur les marchés de gros de Yaoundé et Obala.",
      metrics: [
        { label: isEn ? 'Estimated Net Margin' : 'Marge moyenne estimée', value: '1 450 000 FCFA/ha' },
        { label: isEn ? 'Cashflow Security' : 'Sécurité de trésorerie', value: isEn ? 'High (88%)' : 'Élevée (88%)' },
      ],
    },
  ];
});

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

const goToDashboard = () => {
  router.push('/dashboard');
};

const goToExploitation = () => {
  router.push('/exploitation');
};
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10">
    <div class="w-full max-w-xl flex flex-col">
      <!-- Top Bar: Offline & Telemetry Badges + Quick Language Switcher -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <AppBadge variant="neutral" icon="wifi_off" :pulse="true">
            {{ appStore.t('app.offlineActive') }}
          </AppBadge>
          <AppBadge variant="satellite" icon="satellite_alt">
            NASA IMERG • SMAP
          </AppBadge>
        </div>

        <!-- Language toggle button -->
        <button
          type="button"
          @click="appStore.toggleLanguage"
          class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-variant border border-outline-variant/30 text-on-surface font-label-md text-label-md transition-all cursor-pointer shadow-xs"
        >
          <span class="material-symbols-outlined text-primary text-[16px]">translate</span>
          <span :class="appStore.language === 'en' ? 'font-bold text-primary' : 'opacity-60'">EN</span>
          <span class="opacity-40">|</span>
          <span :class="appStore.language === 'fr' ? 'font-bold text-primary' : 'opacity-60'">FR</span>
        </button>
      </div>

      <!-- Hero Content Card -->
      <div class="relative bg-surface-container rounded-2xl overflow-hidden p-6 mb-6 shadow-sm">
        <div class="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-secondary-fixed opacity-40 blur-2xl pointer-events-none"></div>

        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-semibold tracking-wide uppercase">
            Cameroun • Obala • Bafoussam
          </span>
        </div>

        <h1 class="font-headline-lg text-headline-lg text-primary mb-2">
          {{ appStore.language === 'en' ? 'Crop decisions empowered by Earth observation' : "Vos décisions culturales éclairées par l'espace" }}
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant mb-4">
          {{ appStore.language === 'en'
            ? 'AgroPredict combines NASA satellite radars and local agronomic models to secure your yields and regenerate soils in Central Africa.'
            : 'AgroPredict combine les radars de la NASA et les réalités agronomiques locales pour sécuriser vos rendements et régénérer vos sols en zone sahélienne et équatoriale.'
          }}
        </p>

        <!-- Visual Media Card -->
        <div class="rounded-xl overflow-hidden relative aspect-video bg-surface-container-high mb-4">
          <img
            alt="Exploitation Agricole Cameroun"
            class="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <span class="text-white font-label-md text-label-md flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-[18px]">verified</span>
              {{ appStore.language === 'en' ? 'IRAD Pilot Plot • Obala (Central Region)' : 'Parcelle Pilote IRAD • Obala (Région du Centre)' }}
            </span>
          </div>
        </div>

        <!-- Carousel Slide Content -->
        <div class="bg-surface-container-lowest rounded-xl p-4 transition-all duration-300">
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-primary text-[20px]">
              {{ slides[currentSlide].icon }}
            </span>
            <span class="font-label-md text-label-md text-primary font-semibold">
              {{ slides[currentSlide].category }}
            </span>
          </div>

          <h3 class="font-headline-md text-headline-md text-on-surface mb-1">
            {{ slides[currentSlide].title }}
          </h3>
          <p class="font-body-md text-body-md text-on-surface-variant mb-3">
            {{ slides[currentSlide].description }}
          </p>

          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/30">
            <div
              v-for="(metric, idx) in slides[currentSlide].metrics"
              :key="idx"
              class="flex flex-col"
            >
              <span class="font-caption text-caption text-on-surface-variant">{{ metric.label }}</span>
              <span class="font-body-bold text-label-lg text-on-surface">{{ metric.value }}</span>
            </div>
          </div>
        </div>

        <!-- Carousel Indicators -->
        <div class="flex justify-center items-center gap-2 mt-4">
          <button
            v-for="(slide, index) in slides"
            :key="index"
            class="h-2 rounded-full transition-all cursor-pointer"
            :class="currentSlide === index ? 'w-6 bg-primary' : 'w-2 bg-outline-variant'"
            :aria-label="'Slide ' + (index + 1)"
            @click="currentSlide = index"
          ></button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <AppButton
          variant="primary"
          icon="space_dashboard"
          class="flex-1"
          @click="goToDashboard"
        >
          {{ appStore.language === 'en' ? 'Open Dashboard' : "Accéder à l'accueil" }}
        </AppButton>
        <AppButton
          variant="secondary"
          icon="landscape"
          class="flex-1"
          @click="goToExploitation"
        >
          {{ appStore.language === 'en' ? 'My Farm & Plots' : 'Configurer ma parcelle' }}
        </AppButton>
      </div>

      <!-- Legal disclaimer -->
      <p class="font-caption text-caption text-center text-on-surface-variant mt-4">
        {{ appStore.t('app.disclaimer') }}
      </p>
    </div>
  </div>
</template>
