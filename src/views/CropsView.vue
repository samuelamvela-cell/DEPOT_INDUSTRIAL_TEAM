<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import type { Crop } from '@/types';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const searchQuery = ref('');
const selectedFamily = ref('all');
const selectedWater = ref('all');
const selectedCycle = ref('all');
const selectedCropId = ref<string | null>(null);

const selectedCrop = computed<Crop | null>(() => {
  const list = farmStore.crops;
  return list.find((c) => c.id === selectedCropId.value) || list[0] || null;
});

watch(
  () => farmStore.crops,
  (list) => {
    if (list.length && !selectedCropId.value) selectedCropId.value = list[0].id;
  },
  { immediate: true },
);

const seasonLabel = (season: string) => {
  if (season === 'mars_juin') return tr('March – June', 'Mars – Juin');
  if (season === 'sept_nov') return tr('September – November', 'Septembre – Novembre');
  return season;
};

const families = computed(() => [
  { id: 'all', label: tr('All', 'Toutes') },
  { id: 'cereale', label: tr('Cereals', 'Céréales') },
  { id: 'legumineuse', label: tr('N-fixing legumes', 'Légumineuses N₂') },
  { id: 'tubercule', label: tr('Tubers', 'Tubercules') },
  { id: 'maraichage', label: tr('Horticulture', 'Maraîchage') },
  { id: 'perenne', label: tr('Perennials', 'Pérennes') },
]);

const cropLabel = (crop: Crop) => (appStore.language === 'fr' && crop.nameFr ? crop.nameFr : crop.name);
const cropDescription = (crop: Crop) =>
  appStore.language === 'fr' && crop.descriptionFr ? crop.descriptionFr : crop.description;
const cropStress = (crop: Crop) =>
  appStore.language === 'fr' && crop.stressToleranceFr ? crop.stressToleranceFr : crop.stressTolerance;

const filteredCrops = computed(() =>
  farmStore.crops.filter((crop) => {
    const q = searchQuery.value.trim().toLowerCase();
    if (q && !`${crop.name} ${crop.nameFr ?? ''} ${crop.variety}`.toLowerCase().includes(q)) return false;
    if (selectedFamily.value !== 'all' && crop.family !== selectedFamily.value) return false;
    if (selectedWater.value !== 'all' && crop.waterNeedLevel !== selectedWater.value) return false;
    if (selectedCycle.value === 'court' && crop.cycleDays >= 90) return false;
    if (selectedCycle.value === 'moyen' && (crop.cycleDays < 90 || crop.cycleDays > 120)) return false;
    if (selectedCycle.value === 'long' && crop.cycleDays <= 120) return false;
    return true;
  }),
);

const waterLabel = (level: string) =>
  level === 'faible' ? tr('Low', 'Faible') : level === 'eleve' ? tr('High', 'Élevé') : tr('Moderate', 'Modéré');
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <div class="relative overflow-hidden bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm">
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1 max-w-3xl">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary font-label-md text-label-md">
            <span class="material-symbols-outlined text-[16px]">eco</span>
            <span>{{ tr('IRAD reference catalogue', 'Catalogue de référence IRAD') }}</span>
          </div>
          <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">{{ appStore.t('nav.crops') }}</h1>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {{
              tr(
                'Reference varieties used by the rotation engine: cycle length, water requirement, nitrogen effect and indicative wholesale price.',
                'Variétés de référence utilisées par le moteur de rotation : durée de cycle, besoin en eau, effet azoté et prix de gros indicatif.',
              )
            }}
          </p>
        </div>
        <AppBadge variant="satellite" icon="menu_book">{{ farmStore.crops.length }} {{ tr('varieties', 'variétés') }}</AppBadge>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 border border-outline-variant/30 shadow-sm space-y-3">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[22px]">search</span>
        <input
          v-model="searchQuery"
          class="w-full h-12 pl-12 pr-4 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary border border-outline-variant/30"
          :placeholder="tr('Search a crop (maize, cassava, groundnut…)', 'Rechercher une culture (maïs, manioc, arachide…)')"
          type="text"
        />
      </div>

      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span class="text-on-surface-variant font-body-bold text-label-md mr-1 whitespace-nowrap">{{ tr('Family', 'Famille') }} :</span>
        <button
          v-for="f in families"
          :key="f.id"
          type="button"
          :class="[
            'px-3.5 py-1.5 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors cursor-pointer',
            selectedFamily === f.id ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
          ]"
          @click="selectedFamily = f.id"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 border-t border-outline-variant/20">
        <div class="flex items-center gap-2 text-label-md font-label-md">
          <span class="text-on-surface-variant flex items-center gap-1 font-body-bold">
            <span class="material-symbols-outlined text-[16px] text-tertiary">water_drop</span>
            {{ tr('Water need', 'Besoin en eau') }} :
          </span>
          <div class="inline-flex rounded-lg p-0.5 bg-surface-container">
            <button
              v-for="opt in [
                { id: 'all', label: tr('All', 'Tous') },
                { id: 'faible', label: tr('Low', 'Faible') },
                { id: 'modere', label: tr('Moderate', 'Modéré') },
                { id: 'eleve', label: tr('High', 'Élevé') },
              ]"
              :key="opt.id"
              type="button"
              :class="[
                'px-2.5 py-0.5 rounded-md text-caption cursor-pointer transition-colors',
                selectedWater === opt.id ? 'bg-surface-container-lowest text-primary font-body-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface',
              ]"
              @click="selectedWater = opt.id"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 text-label-md font-label-md">
          <span class="text-on-surface-variant flex items-center gap-1 font-body-bold">
            <span class="material-symbols-outlined text-[16px] text-secondary">schedule</span>
            {{ tr('Cycle', 'Cycle') }} :
          </span>
          <div class="inline-flex rounded-lg p-0.5 bg-surface-container">
            <button
              v-for="opt in [
                { id: 'all', label: tr('All', 'Tous') },
                { id: 'court', label: '< 90 d' },
                { id: 'moyen', label: '90 – 120 d' },
                { id: 'long', label: '> 120 d' },
              ]"
              :key="opt.id"
              type="button"
              :class="[
                'px-2.5 py-0.5 rounded-md text-caption cursor-pointer transition-colors',
                selectedCycle === opt.id ? 'bg-surface-container-lowest text-primary font-body-bold shadow-xs' : 'text-on-surface-variant hover:text-on-surface',
              ]"
              @click="selectedCycle = opt.id"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="farmStore.loadingCrops" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
      <span class="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
      <p class="font-body-md text-caption text-on-surface-variant mt-2">{{ tr('Loading catalogue…', 'Chargement du catalogue…') }}</p>
    </div>

    <div v-else-if="farmStore.cropsError" class="bg-error-container/30 border border-error/40 rounded-2xl p-5 space-y-2">
      <p class="font-body-bold text-label-lg text-error">{{ farmStore.cropsError }}</p>
      <AppButton variant="secondary" size="sm" icon="refresh" @click="farmStore.loadCrops()">{{ tr('Retry', 'Réessayer') }}</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 space-y-3">
        <div class="flex items-center justify-between text-caption text-on-surface-variant px-1">
          <span>{{ filteredCrops.length }} {{ tr('varieties found', 'variétés trouvées') }}</span>
          <span class="hidden sm:inline">{{ tr('Click a card for the full sheet', 'Cliquez pour la fiche complète') }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="crop in filteredCrops"
            :key="crop.id"
            :class="[
              'bg-surface-container-lowest rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden',
              selectedCrop?.id === crop.id ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-outline-variant/30 hover:border-primary/50 shadow-xs',
            ]"
            @click="selectedCropId = crop.id"
          >
            <div>
              <div class="h-32 w-full rounded-xl overflow-hidden mb-3 bg-surface-container">
                <img :src="crop.imageUrl" :alt="cropLabel(crop)" class="w-full h-full object-cover" loading="lazy" />
              </div>
              <div class="flex items-center justify-between mb-1 gap-2">
                <span class="font-body-bold text-label-lg text-on-surface truncate">{{ cropLabel(crop) }}</span>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap',
                    crop.nitrogenFixationKgHa > 0 ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container text-on-surface-variant',
                  ]"
                >
                  {{ crop.nitrogenFixationKgHa > 0 ? '+' : '' }}{{ crop.nitrogenFixationKgHa }} N
                </span>
              </div>
              <p class="font-caption text-caption text-primary font-medium">{{ crop.variety }}</p>
              <p class="font-caption text-caption text-on-surface-variant mt-1 line-clamp-2">{{ cropDescription(crop) }}</p>
            </div>

            <div class="flex items-center justify-between pt-3 mt-2 border-t border-outline-variant/20 text-caption">
              <span class="flex items-center gap-1 text-on-surface-variant">
                <span class="material-symbols-outlined text-[16px]">schedule</span>
                {{ crop.cycleDays }} {{ tr('days', 'jours') }}
              </span>
              <span class="flex items-center gap-1 text-tertiary font-semibold">
                <span class="material-symbols-outlined text-[16px]">water_drop</span>
                {{ crop.waterNeedMm }} mm
              </span>
            </div>
          </div>
        </div>

        <p v-if="!filteredCrops.length" class="text-center font-caption text-caption text-on-surface-variant py-6">
          {{ tr('No variety matches these filters.', 'Aucune variété ne correspond à ces filtres.') }}
        </p>
      </div>

      <div v-if="selectedCrop" class="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-sm space-y-4 lg:sticky lg:top-20">
        <div class="h-44 w-full rounded-xl overflow-hidden relative shadow-sm">
          <img :src="selectedCrop.imageUrl" :alt="cropLabel(selectedCrop)" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end p-4">
            <div class="text-inverse-on-surface">
              <span class="text-caption px-2 py-0.5 rounded bg-surface-container-lowest/30 backdrop-blur-sm">{{ selectedCrop.variety }}</span>
              <h3 class="font-headline-sm text-headline-sm mt-1 font-bold">{{ cropLabel(selectedCrop) }}</h3>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <div class="p-3 bg-surface-container-low rounded-xl space-y-1">
            <span class="font-caption text-caption text-on-surface-variant uppercase tracking-wider block">{{ tr('Agronomic description', 'Description agronomique') }}</span>
            <p class="font-body-md text-body-md text-on-surface">{{ cropDescription(selectedCrop) }}</p>
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Potential yield', 'Rendement potentiel') }}</span>
              <span class="font-body-bold text-label-lg text-primary">{{ (selectedCrop.yieldPotentialKgHa / 1000).toFixed(1) }} t/ha</span>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Indicative price', 'Prix indicatif') }}</span>
              <span class="font-body-bold text-label-lg text-secondary">{{ selectedCrop.marketPriceFcfaKg }} FCFA/kg</span>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Season water need', 'Besoin en eau') }}</span>
              <span class="font-body-bold text-label-lg text-tertiary">{{ selectedCrop.waterNeedMm }} mm</span>
            </div>
            <div class="p-3 rounded-xl bg-surface-container-low">
              <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Nitrogen effect', 'Effet azote') }}</span>
              <span :class="['font-body-bold text-label-lg', selectedCrop.nitrogenFixationKgHa > 0 ? 'text-primary' : 'text-error']">
                {{ selectedCrop.nitrogenFixationKgHa > 0 ? '+' : '' }}{{ selectedCrop.nitrogenFixationKgHa }} kg N/ha
              </span>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5">
            <span class="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified_user</span>
            <div>
              <p class="font-label-md text-label-md text-on-surface font-semibold">{{ tr('Stress tolerance', 'Tolérance au stress') }}</p>
              <p class="font-caption text-caption text-on-surface-variant mt-0.5">{{ cropStress(selectedCrop) }}</p>
            </div>
          </div>

          <div class="p-3 rounded-xl bg-surface-container-low text-caption text-on-surface-variant">
            {{ tr('Water need level', 'Niveau de besoin en eau') }} :
            <strong class="text-on-surface">{{ waterLabel(selectedCrop.waterNeedLevel) }}</strong> ·
            {{ tr('Favourable seasons', 'Saisons favorables') }} :
            <strong class="text-on-surface">{{ selectedCrop.favorableSeasons.map(seasonLabel).join(' · ') }}</strong>
          </div>
        </div>

        <AppButton variant="primary" size="md" :full-width="true" icon="add" @click="router.push('/scenarios')">
          {{ tr('Add to a rotation', 'Intégrer à une rotation') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
