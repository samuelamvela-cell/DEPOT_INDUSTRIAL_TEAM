<script setup lang="ts">
import { ref } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import AppCard from '@/components/common/AppCard.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const farmStore = useFarmStore();

const activeMapMode = ref<'sat' | 'srtm'>('sat');
const isEditing = ref(false);
const saveSuccess = ref(false);

const soilTypes = [
  'Argilo-limoneux ferrallitique',
  'Latéritique rouge profond',
  'Sablo-argileux hydromorphe',
  'Volcanique fertile (Hauts Plateaux)',
];

const priorityGoals = [
  { id: 'marge', label: 'Rendement & Marge en FCFA', icon: 'payments' },
  { id: 'sol', label: 'Régénération durable du sol', icon: 'compost' },
  { id: 'secheresse', label: 'Résilience au stress hydrique', icon: 'water_drop' },
  { id: 'vivrier', label: 'Sécurité alimentaire familiale', icon: 'psychiatry' },
];

const selectedGoals = ref<string[]>(['marge', 'sol', 'secheresse']);

const toggleGoal = (id: string) => {
  if (selectedGoals.value.includes(id)) {
    selectedGoals.value = selectedGoals.value.filter((g) => g !== id);
  } else {
    selectedGoals.value.push(id);
  }
};

const handleSave = () => {
  saveSuccess.value = true;
  isEditing.value = false;
  setTimeout(() => {
    saveSuccess.value = false;
  }, 3000);
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Top Step Overline & Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md tracking-wider uppercase mb-1">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>Étape 01 • Configuration Pédologique &amp; Géographique</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          Définir mon exploitation
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
          Délimitez avec précision le contour cadastral ou physique de votre terre agricole et renseignez ses spécificités pour calibrer les flux de la NASA.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <AppBadge variant="satellite" icon="satellite_alt">
          Capteurs NASA SMAP L3 Connectés
        </AppBadge>
        <AppBadge variant="primary" icon="check_circle">
          Zone Agro-Écologique V (Forêt Bimodale)
        </AppBadge>
      </div>
    </div>

    <!-- Main Bento Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- LEFT: Mapping & Polygon Hub (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">polyline</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Délimitation Numérique de la Parcelle</h3>
              </div>
              <p class="font-caption text-caption text-on-surface-variant">
                Périmètre GPS ajusté sur le bassin Lékié (4°10'15"N, 11°31'40"E)
              </p>
            </div>

            <!-- View Switcher -->
            <div class="inline-flex p-1 bg-surface-container-high rounded-xl self-start">
              <button
                type="button"
                :class="[
                  'px-3 py-1 text-label-md font-label-md rounded-lg transition-all cursor-pointer',
                  activeMapMode === 'sat'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface',
                ]"
                @click="activeMapMode = 'sat'"
              >
                Satellite HD
              </button>
              <button
                type="button"
                :class="[
                  'px-3 py-1 text-label-md font-label-md rounded-lg transition-all cursor-pointer',
                  activeMapMode === 'srtm'
                    ? 'bg-surface-container-lowest text-on-surface shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface',
                ]"
                @click="activeMapMode = 'srtm'"
              >
                Relief SRTM
              </button>
            </div>
          </div>

          <!-- Map Viewport with Polygon and Controls -->
          <div class="relative w-full h-[380px] sm:h-[420px] rounded-xl overflow-hidden shadow-inner bg-surface-dim">
            <!-- Simulated Aerial Satellite Imagery Layer -->
            <img
              class="absolute inset-0 w-full h-full object-cover filter brightness-95"
              alt="Satellite view of Obala field"
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-transparent to-inverse-surface/40 pointer-events-none"></div>

            <!-- SVG Polygon Boundary (Obala Plot 3.2 ha) -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 600 420">
              <defs>
                <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#1F6B3A" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="#8CD79B" stop-opacity="0.2" />
                </linearGradient>
              </defs>
              <polygon
                points="170,80 430,95 485,280 340,360 145,290"
                fill="url(#plotGradient)"
                stroke="#1F6B3A"
                stroke-width="3"
                stroke-dasharray="6,3"
              />
              <!-- Grip handles -->
              <circle cx="170" cy="80" r="7" fill="#FFFFFF" stroke="#005226" stroke-width="3" class="pointer-events-auto cursor-pointer" />
              <circle cx="430" cy="95" r="7" fill="#FFFFFF" stroke="#005226" stroke-width="3" class="pointer-events-auto cursor-pointer" />
              <circle cx="485" cy="280" r="7" fill="#FFFFFF" stroke="#005226" stroke-width="3" class="pointer-events-auto cursor-pointer" />
              <circle cx="340" cy="360" r="7" fill="#FFFFFF" stroke="#005226" stroke-width="3" class="pointer-events-auto cursor-pointer" />
              <circle cx="145" cy="290" r="7" fill="#FFFFFF" stroke="#005226" stroke-width="3" class="pointer-events-auto cursor-pointer" />
            </svg>

            <!-- Floating Target Pin & Coordinate Bubble -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
              <div class="px-3 py-1 rounded-full bg-inverse-surface/90 text-inverse-on-surface shadow-md backdrop-blur-md flex items-center gap-1.5 mb-1.5 animate-bounce">
                <span class="material-symbols-outlined text-[16px] text-secondary-container">location_on</span>
                <span class="font-label-md text-label-md tracking-wide">4°10'15"N, 11°31'40"E</span>
              </div>
              <div class="w-3.5 h-3.5 rounded-full bg-secondary-container shadow-[0_0_12px_rgba(253,191,64,0.9)] ring-4 ring-white/50"></div>
            </div>

            <!-- Top Left Floating Geospatial Tools -->
            <div class="absolute top-4 left-4 flex flex-col gap-1.5 bg-surface-container-lowest/90 backdrop-blur-md p-1.5 rounded-xl shadow-md">
              <button class="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center transition-transform active:scale-95 cursor-pointer" title="Mode Tracé Polygone" type="button">
                <span class="material-symbols-outlined text-[20px]">edit</span>
              </button>
              <button class="w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer" title="Centrer sur mon GPS" type="button">
                <span class="material-symbols-outlined text-[20px]">my_location</span>
              </button>
              <button class="w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer" title="Zoom avant" type="button">
                <span class="material-symbols-outlined text-[20px]">add</span>
              </button>
              <button class="w-10 h-10 rounded-lg text-on-surface hover:bg-surface-container-high flex items-center justify-center transition-colors cursor-pointer" title="Zoom arrière" type="button">
                <span class="material-symbols-outlined text-[20px]">remove</span>
              </button>
            </div>

            <!-- Bottom Floating HUD Badge -->
            <div class="absolute bottom-4 left-4 right-4 flex items-center justify-between text-surface-container-lowest bg-inverse-surface/80 backdrop-blur-md px-4 py-2 rounded-xl text-caption">
              <span>Superficie calculée : <strong class="text-secondary-fixed text-label-lg">{{ farmStore.activePlot.surfaceHa }} ha</strong> (env. 51 piquets)</span>
              <span>Pente SRTM : <strong class="text-primary-fixed">{{ farmStore.activePlot.slopePercent }}% (Faible)</strong></span>
            </div>
          </div>
        </div>

        <!-- SRTM Topographic Insight Card -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">terrain</span>
          </div>
          <div>
            <h4 class="font-body-bold text-label-lg text-on-surface">Topographie &amp; Réserve Utile (RU)</h4>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5">
              Pente modérée de {{ farmStore.activePlot.slopePercent }}% favorable à une bonne infiltration de la pluie sans ravinement. Réserve utile estimée : <strong>{{ farmStore.activePlot.availableWaterCapacityMm }} mm/m</strong>.
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT: Farm Profile Form & Objectives (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/30 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Spécificités Pédologiques</h3>
            <span class="font-caption text-caption text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full font-semibold">
              Calibrage NASA
            </span>
          </div>

          <!-- Form Fields -->
          <div class="space-y-3">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">Nom de la parcelle</label>
              <input
                v-model="farmStore.activePlot.name"
                class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
                type="text"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1">Superficie (ha)</label>
                <input
                  v-model.number="farmStore.activePlot.surfaceHa"
                  class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
                  type="number"
                  step="0.1"
                />
              </div>

              <div>
                <label class="block font-label-md text-label-md text-on-surface mb-1">Acidité (pH eau)</label>
                <input
                  v-model.number="farmStore.activePlot.soilPh"
                  class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary"
                  type="number"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">Texture dominante du sol</label>
              <select
                v-model="farmStore.activePlot.soilType"
                class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option v-for="t in soilTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">Antécédent cultural (N-1)</label>
              <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <p class="font-body-bold text-label-lg text-on-surface">
                    {{ farmStore.activePlot.previousCrop.cropName }} ({{ farmStore.activePlot.previousCrop.variety }})
                  </p>
                  <p class="font-caption text-caption text-on-surface-variant">
                    Récolté en {{ farmStore.activePlot.previousCrop.harvestDate }} • {{ farmStore.activePlot.previousCrop.yieldTonnesHa }} t/ha
                  </p>
                </div>
                <span class="text-caption font-caption text-primary bg-surface-container px-2 py-0.5 rounded">
                  Azote : {{ farmStore.activePlot.previousCrop.residualNitrogenKgHa }} kg N/ha
                </span>
              </div>
            </div>
          </div>

          <!-- Priorities Checkbox selection -->
          <div class="pt-3 border-t border-outline-variant/20">
            <label class="block font-label-md text-label-md text-on-surface mb-2">
              Vos priorités paysannes pour la campagne
            </label>
            <div class="space-y-2">
              <div
                v-for="goal in priorityGoals"
                :key="goal.id"
                :class="[
                  'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border',
                  selectedGoals.includes(goal.id)
                    ? 'bg-primary-fixed/20 border-primary text-on-surface'
                    : 'bg-surface-container-low border-transparent text-on-surface-variant hover:bg-surface-container',
                ]"
                @click="toggleGoal(goal.id)"
              >
                <span class="material-symbols-outlined text-[20px] text-primary">
                  {{ selectedGoals.includes(goal.id) ? 'check_box' : 'check_box_outline_blank' }}
                </span>
                <span class="font-body-md text-label-lg flex-1">{{ goal.label }}</span>
                <span class="material-symbols-outlined text-[18px] opacity-60">{{ goal.icon }}</span>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <div class="pt-2">
            <AppButton
              variant="primary"
              size="lg"
              :full-width="true"
              icon="save"
              @click="handleSave"
            >
              Enregistrer la parcelle
            </AppButton>
            <p v-if="saveSuccess" class="font-label-md text-caption text-center text-primary mt-2">
              ✓ Parcelle synchronisée avec les modèles NASA &amp; IRAD !
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
