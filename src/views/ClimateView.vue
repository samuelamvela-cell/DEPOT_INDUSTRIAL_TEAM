<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import { useAuthStore } from '@/stores/authStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const farmStore = useFarmStore();
const appStore = useAppStore();
const auth = useAuthStore();
const tr = appStore.tr;

type Layer = 'rain' | 'et0' | 'soil' | 'temp';
const activeLayer = ref<Layer>('rain');

const layers = computed<{ id: Layer; label: string; icon: string; source: string }[]>(() => [
  { id: 'rain', label: tr('Rainfall', 'Pluviométrie'), icon: 'rainy', source: 'PRECTOTCORR' },
  { id: 'et0', label: tr('Evapotranspiration', 'Évapotranspiration'), icon: 'water_drop', source: 'EVPTRNS' },
  { id: 'soil', label: tr('Soil wetness', 'Humidité du sol'), icon: 'water_loss', source: 'GWETTOP / GWETROOT' },
  { id: 'temp', label: tr('Temperature', 'Température'), icon: 'device_thermostat', source: 'T2M / T2M_MAX / T2M_MIN' },
]);

const climate = computed(() => farmStore.telemetry);
const plot = computed(() => farmStore.activePlot);

const monthLabels = computed(() =>
  appStore.language === 'fr'
    ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
);

const chartMax = computed(() => {
  const months = climate.value?.monthly ?? [];
  const values = months.flatMap((m) => [m.rainClimatologyMm ?? 0, m.rainCurrentYearMm ?? 0, m.et0Mm ?? 0]);
  return Math.max(100, ...values) * 1.1;
});

const monthName = (month: number) => {
  const full =
    appStore.language === 'fr'
      ? ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return full[month - 1] || '';
};

const seedingWindowLabel = computed(() => {
  const w = climate.value?.nextSeedingWindow;
  if (!w) return null;
  const start = new Date(w.start);
  const end = new Date(w.end);
  return `${start.getUTCDate()} – ${end.getUTCDate()} ${monthName(end.getUTCMonth() + 1)} ${end.getUTCFullYear()}`;
});

const exportCsv = () => {
  if (!climate.value) return;
  const rows = [
    ['month', 'rain_climatology_mm', 'rain_current_year_mm', 'et0_mm'].join(','),
    ...climate.value.monthly.map((m) =>
      [monthLabels.value[m.month - 1], m.rainClimatologyMm ?? '', m.rainCurrentYearMm ?? '', m.et0Mm ?? ''].join(','),
    ),
  ].join('\n');
  const blob = new Blob([rows], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agropredict-climate-${plot.value?.code || 'plot'}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const fmt = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined ? '—' : Number(v).toFixed(digits);
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md uppercase tracking-wider mb-1">
          <span class="material-symbols-outlined text-[18px]">satellite_alt</span>
          <span>{{ tr('Earth observation & local agro-meteorology', 'Télédétection & agro-météorologie locale') }}</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">{{ tr('Agro-climatic analysis', 'Analyse agro-climatique') }}</h1>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-0.5">
          {{
            tr(
              `Rainfall, soil wetness and evapotranspiration requested live from NASA POWER for ${plot ? plot.name : 'your plot'}.`,
              `Pluies, humidité du sol et évapotranspiration demandées en direct à NASA POWER pour ${plot ? plot.name : 'votre parcelle'}.`,
            )
          }}
        </p>
      </div>

      <div class="flex items-center gap-2.5 shrink-0">
        <AppButton variant="primary" icon="download" :disabled="!climate" @click="exportCsv">
          {{ tr('Export monthly CSV', 'Exporter le CSV mensuel') }}
        </AppButton>
        <button
          type="button"
          class="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-variant flex items-center justify-center transition-colors cursor-pointer"
          :title="tr('Refresh NASA data', 'Rafraîchir les données NASA')"
          @click="farmStore.loadTelemetry(true)"
        >
          <span class="material-symbols-outlined text-[20px]">refresh</span>
        </button>
      </div>
    </div>

    <!-- Layer tabs -->
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
        @click="activeLayer = layer.id"
      >
        <span class="material-symbols-outlined text-[20px]">{{ layer.icon }}</span>
        <span>{{ layer.label }}</span>
      </button>
    </div>

    <!-- Loading / error -->
    <div v-if="farmStore.loadingTelemetry" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
      <span class="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
      <p class="font-body-md text-caption text-on-surface-variant mt-2">{{ tr('Requesting NASA POWER…', 'Requête NASA POWER…') }}</p>
    </div>

    <div v-else-if="farmStore.telemetryError" class="bg-error-container/30 border border-error/40 rounded-2xl p-5 space-y-2">
      <p class="font-body-bold text-label-lg text-error">{{ tr('NASA POWER did not answer', 'NASA POWER n’a pas répondu') }}</p>
      <p class="font-caption text-caption text-on-surface-variant">{{ farmStore.telemetryError }}</p>
      <AppButton variant="secondary" size="sm" icon="refresh" @click="farmStore.loadTelemetry(true)">
        {{ tr('Retry', 'Réessayer') }}
      </AppButton>
    </div>

    <div v-else-if="!climate" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-primary text-[36px]">add_location_alt</span>
      <p class="font-body-md text-caption text-on-surface-variant">
        {{ tr('Register a plot to load its climate telemetry.', 'Enregistrez une parcelle pour charger sa télémétrie climatique.') }}
      </p>
      <RouterLink to="/onboarding" class="font-body-bold text-caption text-primary hover:underline">
        {{ tr('Create a plot', 'Créer une parcelle') }}
      </RouterLink>
    </div>

    <template v-else>
      <!-- Provenance banner -->
      <div class="bg-surface-container-lowest p-4 sm:p-5 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">public</span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-body-bold text-label-lg text-tertiary">
                {{ layers.find((l) => l.id === activeLayer)?.source }}
              </span>
              <span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span class="font-label-md text-caption text-on-surface-variant">{{ climate.provenance.resolution }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span class="font-label-md text-caption text-on-surface-variant">MERRA-2 · {{ climate.provenance.timeStandard }}</span>
            </div>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5">
              {{ tr('Fetched', 'Récupéré') }} {{ new Date(climate.provenance.fetchedAt).toLocaleString() }}
              ({{ climate.provenance.provider }} {{ climate.provenance.apiVersion }})
            </p>
          </div>
        </div>
        <AppBadge variant="success" icon="check_circle">{{ tr('Upstream verified', 'Flux validé') }}</AppBadge>
      </div>

      <!-- Chart + readouts -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-8 bg-surface-container-lowest p-5 sm:p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-label-md text-caption uppercase">
                    {{ tr('Bimodal regime', 'Régime bimodal') }}
                  </span>
                  <span class="font-caption text-caption text-on-surface-variant">{{ plot?.coordinates.region }}</span>
                </div>
                <h2 class="font-headline-sm text-headline-sm text-on-surface mt-1">
                  {{ tr('Monthly water balance', 'Bilan hydrique mensuel') }}
                </h2>
              </div>

              <div class="flex items-center gap-3 flex-wrap">
                <div class="flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 rounded-xs bg-tertiary"></span>
                  <span class="font-label-md text-caption text-on-surface-variant">{{ tr('25-year normal', 'Normale 25 ans') }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 rounded-xs bg-primary"></span>
                  <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Current campaign', 'Campagne en cours') }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-0.5 border-t-2 border-dashed border-secondary"></span>
                  <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Evapotranspiration', 'Évapotranspiration') }}</span>
                </div>
              </div>
            </div>

            <div class="relative pt-4 pb-2">
              <div class="grid grid-cols-12 gap-1.5 sm:gap-2 h-56 items-end border-b border-outline-variant/40 pb-1">
                <div
                  v-for="item in climate.monthly"
                  :key="item.month"
                  class="flex flex-col items-center h-full justify-end group relative"
                >
                  <div class="absolute -top-8 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div class="bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap">
                      {{ monthLabels[item.month - 1] }} · {{ tr('normal', 'normale') }} {{ fmt(item.rainClimatologyMm) }} mm ·
                      {{ tr('season', 'saison') }} {{ fmt(item.rainCurrentYearMm) }} mm · ET0 {{ fmt(item.et0Mm) }} mm
                    </div>
                    <div class="w-2 h-1 bg-inverse-surface rotate-45 -mt-0.5"></div>
                  </div>

                  <div class="w-full flex items-end justify-center gap-1 h-full">
                    <div
                      class="w-2 sm:w-3 bg-tertiary/75 rounded-t-sm transition-all"
                      :style="{ height: `${((item.rainClimatologyMm ?? 0) / chartMax) * 100}%` }"
                    ></div>
                    <div
                      class="w-2 sm:w-3 bg-primary rounded-t-sm transition-all"
                      :style="{ height: `${((item.rainCurrentYearMm ?? 0) / chartMax) * 100}%` }"
                    ></div>
                    <div
                      class="w-2 sm:w-3 border-t-2 border-dashed border-secondary self-end"
                      :style="{ marginBottom: `${((item.et0Mm ?? 0) / chartMax) * 100}%` }"
                    ></div>
                  </div>

                  <span class="font-label-md text-caption text-on-surface-variant mt-2">{{ monthLabels[item.month - 1] }}</span>
                </div>
              </div>

              <p class="font-caption text-[11px] text-on-surface-variant mt-3">
                {{
                  tr(
                    `Observation window ${climate.observed.start} → ${climate.observed.end}. Months not yet observed in the current campaign are left blank.`,
                    `Fenêtre d’observation ${climate.observed.start} → ${climate.observed.end}. Les mois non encore observés de la campagne sont laissés vides.`,
                  )
                }}
              </p>
            </div>
          </div>

          <div
            v-if="climate.drySpell.warning"
            class="mt-6 p-4 rounded-xl bg-secondary-fixed/30 border border-secondary flex items-start gap-3"
          >
            <span class="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">warning</span>
            <div>
              <h4 class="font-body-bold text-label-lg text-on-secondary-fixed">{{ tr('Wet-season dry spell', 'Pause sèche en saison des pluies') }}</h4>
              <p class="font-caption text-caption sm:text-body-md text-on-secondary-fixed-variant mt-0.5">
                {{
                  tr(
                    `The ${climate.drySpell.thresholdMm} mm threshold is not reached in month(s) ${climate.drySpell.months.join(', ')} while rain returns before and after. Plan harvests and mulch accordingly.`,
                    `Le seuil de ${climate.drySpell.thresholdMm} mm n’est pas atteint au(x) mois ${climate.drySpell.months.join(', ')} alors que la pluie revient avant et après. Planifiez récoltes et paillage.`,
                  )
                }}
              </p>
            </div>
          </div>
          <div v-else class="mt-6 p-4 rounded-xl bg-primary-fixed/20 border border-primary-fixed/60 flex items-start gap-3">
            <span class="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">check_circle</span>
            <p class="font-caption text-caption text-on-surface-variant">
              {{ tr('No month of the wet season falls below the dry-spell threshold in the 25-year normal.', 'Aucun mois de la saison des pluies ne passe sous le seuil de pause sèche dans la normale 25 ans.') }}
            </p>
          </div>
        </div>

        <!-- Right column -->
        <div class="lg:col-span-4 space-y-4">
          <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-primary">
              <span class="material-symbols-outlined text-[22px]">calendar_month</span>
              <h4 class="font-body-bold text-label-lg">{{ tr('Sowing window', 'Fenêtre de semis') }}</h4>
            </div>
            <div class="p-3 bg-surface-container-low rounded-xl">
              <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Computed onset', 'Installation calculée') }}</span>
              <span class="font-headline-sm text-headline-sm text-primary font-bold">
                {{ seedingWindowLabel || tr('Not detectable', 'Non détectable') }}
              </span>
              <p class="font-caption text-caption text-on-surface-variant mt-1">
                {{ tr('Normal onset rainfall', 'Pluie normale du mois d’installation') }}:
                <strong>{{ climate.nextSeedingWindow?.normalRainMm ?? '—' }} mm</strong>
              </p>
            </div>
            <p class="font-caption text-caption text-on-surface-variant">
              {{
                tr(
                  'First month of the 25-year normal reaching 100 mm after a month below it. Anchored on NASA POWER climatology, not on a forecast.',
                  'Premier mois de la normale 25 ans atteignant 100 mm après un mois inférieur. Ancré sur la climatologie NASA POWER, pas sur une prévision.',
                )
              }}
            </p>
          </div>

          <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
            <div class="flex items-center gap-2 text-tertiary">
              <span class="material-symbols-outlined text-[22px]">water_loss</span>
              <h4 class="font-body-bold text-label-lg">{{ tr('Soil wetness (last 7 days)', 'Humidité du sol (7 derniers jours)') }}</h4>
            </div>
            <div class="space-y-2">
              <div>
                <div class="flex justify-between font-caption text-caption mb-1">
                  <span class="text-on-surface-variant">{{ tr('Surface (0–5 cm)', 'Surface (0–5 cm)') }}</span>
                  <strong class="text-tertiary">{{ fmt(climate.soilMoistureSurfacePercent) }}%</strong>
                </div>
                <div class="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
                  <div class="bg-tertiary h-full rounded-full" :style="{ width: `${climate.soilMoistureSurfacePercent ?? 0}%` }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between font-caption text-caption mb-1">
                  <span class="text-on-surface-variant">{{ tr('Root zone', 'Zone racinaire') }}</span>
                  <strong class="text-primary">{{ fmt(climate.soilMoistureRootPercent) }}%</strong>
                </div>
                <div class="w-full bg-surface-container-highest h-2.5 rounded-full overflow-hidden">
                  <div class="bg-primary h-full rounded-full" :style="{ width: `${climate.soilMoistureRootPercent ?? 0}%` }"></div>
                </div>
              </div>
            </div>
            <p class="font-caption text-caption text-on-surface-variant">
              {{ tr('Fraction of saturation from GWETTOP and GWETROOT. Values above 40% indicate a workable seedbed.', 'Fraction de saturation issue de GWETTOP et GWETROOT. Au-delà de 40 %, le lit de semence est travaillable.') }}
            </p>
          </div>

          <div class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-body-bold text-label-lg text-on-surface">{{ tr('Campaign totals', 'Cumuls de campagne') }}</span>
              <AppBadge variant="neutral">{{ plot?.coordinates.locality }}</AppBadge>
            </div>
            <dl class="space-y-1.5 font-caption text-caption">
              <div class="flex justify-between border-b border-outline-variant/20 py-1">
                <dt class="text-on-surface-variant">{{ tr('Rain, 30 days', 'Pluie, 30 jours') }}</dt>
                <dd class="font-body-bold">{{ fmt(climate.rainfall30dMm, 1) }} mm ({{ climate.rainfall30dDays }} {{ tr('days', 'jours') }})</dd>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-1">
                <dt class="text-on-surface-variant">{{ tr('Rain, current campaign', 'Pluie, campagne en cours') }}</dt>
                <dd class="font-body-bold">{{ fmt(climate.currentYearMm, 1) }} mm</dd>
              </div>
              <div class="flex justify-between border-b border-outline-variant/20 py-1">
                <dt class="text-on-surface-variant">{{ tr('25-year annual normal', 'Normale annuelle 25 ans') }}</dt>
                <dd class="font-body-bold">{{ fmt(climate.climatologyAnnualMm, 1) }} mm</dd>
              </div>
              <div class="flex justify-between py-1">
                <dt class="text-on-surface-variant">{{ tr('Relative humidity', 'Humidité relative') }}</dt>
                <dd class="font-body-bold">{{ fmt(climate.humidityPercent, 1) }}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <p class="font-caption text-caption text-center text-on-surface-variant">
        {{ appStore.t('app.disclaimer') }}
      </p>
    </template>
  </div>
</template>
