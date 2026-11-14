<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '@/components/common/AppButton.vue';
import AppBadge from '@/components/common/AppBadge.vue';

const router = useRouter();
const currentSlide = ref(0);

const slides = [
  {
    title: 'Données Satellite Précises',
    category: 'Pilier 1 • Télémesure',
    icon: 'satellite_alt',
    description: "Observation directe de l'humidité de vos sols, de la pluie imminente (NASA IMERG) et de la vigueur végétale sans acheter aucun capteur physique coûteux.",
    metrics: [
      { label: 'Précipitation estimée', value: '+42 mm / décade' },
      { label: 'Humidité racinaire', value: 'Idéale semis' },
    ],
  },
  {
    title: 'Simulateur de Rotations',
    category: 'Pilier 2 • Planification',
    icon: 'autorenew',
    description: "Testez l'enchaînement de vos cultures vivrières phares (Maïs, Manioc, Arachide, Niébé) sur 3 saisons avant d'engager vos semences et intrants.",
    metrics: [
      { label: 'Succession recommandée', value: 'Maïs → Niébé' },
      { label: 'Fixation symbiotique', value: '+45 kg N/ha' },
    ],
  },
  {
    title: 'Rentabilité en FCFA',
    category: 'Pilier 3 • Économie',
    icon: 'payments',
    description: "Estimez vos marges brutes et nettes à l'hectare selon les cours réels sur les marchés de gros de Yaoundé et Obala.",
    metrics: [
      { label: 'Marge moyenne estimée', value: '1 450 000 FCFA/ha' },
      { label: 'Sécurité de trésorerie', value: 'Élevée (88%)' },
    ],
  },
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length;
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
      <!-- Top Offline & Telemetry Badges -->
      <div class="flex items-center justify-between mb-4">
        <AppBadge variant="neutral" icon="wifi_off" :pulse="true">
          Mode Hors-ligne Actif
        </AppBadge>
        <AppBadge variant="satellite" icon="satellite_alt">
          NASA IMERG • SMAP
        </AppBadge>
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
          Vos décisions culturales éclairées par l'espace
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant mb-4">
          AgroPredict combine les radars de la NASA et les réalités agronomiques locales pour sécuriser vos rendements et régénérer vos sols en zone sahélienne et équatoriale.
        </p>

        <!-- Visual Media Card -->
        <div class="relative w-full h-48 rounded-xl overflow-hidden shadow-inner bg-surface-container-high">
          <img
            class="w-full h-full object-cover"
            alt="Agronome camerounais"
            src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/25 to-transparent"></div>
          <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between text-surface">
            <div class="flex items-center gap-1.5">
              <span class="material-symbols-outlined text-primary-fixed text-lg">public</span>
              <span class="font-caption text-caption text-surface-container-lowest">
                Surveillance régionale active • Zone Centre &amp; Ouest
              </span>
            </div>
            <span class="font-label-md text-label-md bg-inverse-surface/70 px-2 py-0.5 rounded text-secondary-fixed">
              24.6°C • Humidité 68%
            </span>
          </div>
        </div>
      </div>

      <!-- 3 Piliers Carousel Section -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-headline-sm text-headline-sm text-on-surface">3 piliers pour vos récoltes</h2>
          <!-- Slide controls -->
          <div class="flex items-center gap-1.5">
            <button
              aria-label="Précédent"
              class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-variant transition cursor-pointer"
              @click="prevSlide"
            >
              <span class="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              aria-label="Suivant"
              class="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-variant transition cursor-pointer"
              @click="nextSlide"
            >
              <span class="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>

        <!-- Slide Content -->
        <div class="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-5 shadow-sm border border-outline-variant/20">
          <div class="flex items-center justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shadow-xs">
              <span class="material-symbols-outlined text-2xl">{{ slides[currentSlide].icon }}</span>
            </div>
            <span class="font-label-md text-label-md uppercase font-semibold text-tertiary bg-surface-container-low px-2.5 py-1 rounded-full">
              {{ slides[currentSlide].category }}
            </span>
          </div>

          <h3 class="font-headline-sm text-headline-sm text-on-surface mb-1">
            {{ slides[currentSlide].title }}
          </h3>
          <p class="font-body-md text-body-md text-on-surface-variant mb-4">
            {{ slides[currentSlide].description }}
          </p>

          <!-- Metric badges strip -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div
              v-for="metric in slides[currentSlide].metrics"
              :key="metric.label"
              class="bg-surface-container-low p-2.5 rounded-xl flex flex-col"
            >
              <span class="font-caption text-caption text-on-surface-variant">{{ metric.label }}</span>
              <span class="font-body-bold text-body-bold text-primary">{{ metric.value }}</span>
            </div>
          </div>

          <!-- Slide indicators -->
          <div class="flex justify-center gap-1.5 mt-4">
            <span
              v-for="(_, index) in slides"
              :key="index"
              :class="[
                'h-1.5 rounded-full transition-all duration-300',
                currentSlide === index ? 'w-6 bg-primary' : 'w-1.5 bg-outline-variant',
              ]"
            ></span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <AppButton
          variant="primary"
          size="lg"
          :full-width="true"
          icon="landscape"
          @click="goToExploitation"
        >
          Définir mon exploitation
        </AppButton>
        <AppButton
          variant="secondary"
          size="lg"
          :full-width="true"
          icon="space_dashboard"
          @click="goToDashboard"
        >
          Accéder au tableau de bord
        </AppButton>
      </div>

      <!-- Legal mention -->
      <p class="font-caption text-caption text-center text-on-surface-variant mt-6">
        Estimation indicative, pas une prévision de rendement.
      </p>
    </div>
  </div>
</template>
