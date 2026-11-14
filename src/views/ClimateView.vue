<script setup lang="ts">
import { ref } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const farmStore = useFarmStore();
const activeLayer = ref<'rain' | 'temp' | 'soil' | 'ndvi'>('rain');

const layers = [
  { id: 'rain', label: 'Pluie (IMERG)', icon: 'rainy', source: 'NASA GPM IMERG' },
  { id: 'temp', label: 'Température (POWER)', icon: 'device_thermostat', source: 'NASA POWER' },
  { id: 'soil', label: 'Humidité du sol (SMAP)', icon: 'water_loss', source: 'NASA SMAP L3' },
  { id: 'ndvi', label: 'Végétation NDVI (MODIS)', icon: 'psychiatry', source: 'MODIS / Sentinel' },
];

const exportPdf = () => {
  alert("Génération de l'itinéraire agrométéorologique en PDF léger (<180 Ko)...");
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header with Telemetry Pill & Export -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-wider mb-1">
          <span class="material-symbols-outlined text-[18px]">satellite_alt</span>
          <span>Télédétection &amp; Agro-Météorologie Locale</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">Analyse Agro-Climatique</h1>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-0.5">
          Suivi des dynamiques pluviométriques et hydriques issues de la constellation spatiale NASA pour la parcelle d'Obala (Centre-Cameroun).
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <AppButton variant="primary" icon="picture_as_pdf" @click="exportPdf">
          Exporter calendrier PDF
        </AppButton>
        <button
          type="button"
          class="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-variant flex items-center justify-center transition-colors cursor-pointer"
          title="Partager"
        >
          <span class="material-symbols-outlined text-[20px]">share</span>
        </button>
      </div>
    </div>

    <!-- Segmented Navigation Tabs (Earth Observation Layers) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        v-for="layer in layers"
        :key="layer.id"
        type="button"
        :class="[
          'min-h-[48px] px-4 py-2.5 rounded-xl font-body-bold text-label-lg flex items-center gap-2 transition-all whitespace-nowrap shadow-xs cursor-pointer',
          activeLayer === layer.id
            ? 'bg-primary text-on-primary shadow-sm'
            : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
        ]"
        @click="activeLayer = layer.id as any"
      >
        <span class="material-symbols-outlined text-[20px]">{{ layer.icon }}</span>
        <span>{{ layer.label }}</span>
        <span
          v-if="activeLayer === layer.id"
          class="ml-1 px-1.5 py-0.2 bg-primary-container text-on-primary-container rounded-full text-caption"
        >
          Actif
        </span>
      </button>
    </div>

    <!-- Satellite Source Metadata Banner -->
    <div class="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[24px]">public</span>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-body-bold text-label-lg text-tertiary">
              Source active : {{ layers.find(l => l.id === activeLayer)?.source }}
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span class="font-label-md text-caption text-on-surface-variant">Série 2004–2024 (20 ans de recul)</span>
            <span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span class="font-label-md text-caption text-on-surface-variant">Calibré IRAD Nkolbisson</span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant mt-0.5">
            Dernière passe satellite : il y a 3h (Calibrage barycentrique &amp; correction nuageuse équatoriale)
          </p>
        </div>
      </div>
      <AppBadge variant="success" icon="check_circle">Flux Validé</AppBadge>
    </div>

    <!-- Main Chart & Agronomic Diagnosis (12 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Big Bimodal Rainfall Chart Module (8 cols) -->
      <div class="lg:col-span-8 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-caption uppercase">
                  Régime Bimodal
                </span>
                <span class="font-caption text-caption text-on-surface-variant">Bassin d'Obala &amp; Lékié</span>
              </div>
              <h2 class="font-headline-sm text-headline-sm text-on-surface mt-1">
                Pluviométrie Mensuelle &amp; Besoins Culturaux
              </h2>
            </div>

            <!-- Legend -->
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-xs bg-tertiary"></span>
                <span class="font-label-md text-caption text-on-surface-variant">Moyenne 20 ans</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-3.5 h-3.5 rounded-xs bg-primary"></span>
                <span class="font-label-md text-caption text-on-surface-variant">Année 2024/2025</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-4 h-0.5 border-t-2 border-dashed border-secondary"></span>
                <span class="font-label-md text-caption text-on-surface-variant">Besoin Maïs/Niébé</span>
              </div>
            </div>
          </div>

          <!-- CSS Bar Chart (12 months) -->
          <div class="relative pt-6 pb-2">
            <!-- Peak zones indicators -->
            <div class="grid grid-cols-12 gap-1.5 sm:gap-2 h-56 items-end border-b border-outline-variant/40 pb-1">
              <div
                v-for="item in farmStore.climate.monthlyRainfallData"
                :key="item.month"
                class="flex flex-col items-center h-full justify-end group relative"
              >
                <!-- Tooltip -->
                <div class="absolute -top-10 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div class="bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                    20 ans: {{ item.rain20yAvgMm }}mm | Actuel: {{ item.rainCurrentYearMm }}mm
                  </div>
                  <div class="w-2 h-1 bg-inverse-surface rotate-45 -mt-0.5"></div>
                </div>

                <!-- Bars grouped -->
                <div class="w-full flex items-end justify-center gap-1 h-full">
                  <!-- Avg 20y bar -->
                  <div
                    class="w-2 sm:w-3 bg-tertiary/75 rounded-t-sm transition-all"
                    :style="{ height: `${(item.rain20yAvgMm / 320) * 100}%` }"
                  ></div>
                  <!-- Current year bar -->
                  <div
                    class="w-2 sm:w-3 bg-primary rounded-t-sm transition-all"
                    :style="{ height: `${(item.rainCurrentYearMm / 320) * 100}%` }"
                  ></div>
                </div>

                <!-- Month label -->
                <span class="font-label-md text-caption text-on-surface-variant mt-2">
                  {{ item.month }}
                </span>
              </div>
            </div>

            <!-- Bimodal Season highlight badges under chart -->
            <div class="grid grid-cols-12 gap-1 pt-3 text-center">
              <div class="col-span-2 text-[10px] font-semibold text-outline">Saison Sèche</div>
              <div class="col-span-4 text-[10px] font-semibold text-primary bg-primary-fixed/30 rounded py-0.5">
                Petite Saison (Mars-Juin)
              </div>
              <div class="col-span-2 text-[10px] font-semibold text-secondary bg-secondary-fixed/30 rounded py-0.5">
                Pause Sèche
              </div>
              <div class="col-span-3 text-[10px] font-semibold text-tertiary bg-tertiary-fixed/40 rounded py-0.5">
                Grande Saison (Sept-Nov)
              </div>
              <div class="col-span-1 text-[10px] font-semibold text-outline">Sèche</div>
            </div>
          </div>
        </div>

        <!-- Dry Spell Alert -->
        <div class="mt-6 p-4 rounded-xl bg-secondary-fixed/30 border border-secondary flex items-start gap-3">
          <span class="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">warning</span>
          <div>
            <h4 class="font-body-bold text-label-lg text-on-secondary-fixed">Alerte Pause Sèche Estivale</h4>
            <p class="font-caption text-caption sm:text-body-md text-on-secondary-fixed-variant mt-0.5">
              La coupure pluviométrique de mi-juillet à fin août nécessite impérativement de récolter les céréales semées en mars avant le 10 juillet, ou d’engager un paillage protecteur.
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column: Microclimate Telemetry Readout (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <!-- Telemetry Card 1: Seeding window -->
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
          <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-[22px]">calendar_month</span>
            <h4 class="font-body-bold text-label-lg">Fenêtre Optimale de Semis</h4>
          </div>
          <div class="p-3 bg-surface-container-low rounded-xl">
            <span class="font-caption text-caption text-on-surface-variant block">Date idéale calculée</span>
            <span class="font-headline-sm text-headline-sm text-primary font-bold">15 Mars ± 4 jours</span>
            <p class="font-caption text-caption text-on-surface-variant mt-1">
              Probabilité d'installation de la mousson : <strong>94%</strong>
            </p>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Un semis hâtif avant le 10 mars expose à un faux départ pluviométrique. Un semis après le 25 mars raccourcit le cycle avant la coupure d'août.
          </p>
        </div>

        <!-- Telemetry Card 2: Soil Root-zone Moisture -->
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
          <div class="flex items-center gap-2 text-tertiary">
            <span class="material-symbols-outlined text-[22px]">water_loss</span>
            <h4 class="font-body-bold text-label-lg">Humidité Racinaire SMAP</h4>
          </div>
          <div class="flex items-baseline justify-between">
            <span class="font-display-lg text-headline-lg text-tertiary font-bold">34%</span>
            <span class="font-label-md text-label-md text-primary font-semibold">Réserve Utile à 78%</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
            <div class="bg-tertiary h-full rounded-full" style="width: 78%"></div>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Humidité idéale en couche arable (0-20 cm) pour assurer la germination rapide des semences de céréales et légumineuses.
          </p>
        </div>

        <!-- Telemetry Card 3: NDVI active biomasse -->
        <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-body-bold text-label-lg text-on-surface">Vigueur Foliaire (NDVI)</span>
            <span class="font-body-bold text-label-lg text-primary">0.74</span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Indice MODIS / Sentinel mesuré sur la Lékié. Indique un couvert végétal pérenne vigoureux et une faible érosion foliaire.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
