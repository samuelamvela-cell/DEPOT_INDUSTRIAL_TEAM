<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import type { RotationScenario, ScoringWeights } from '@/types';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const axes = computed(() => [
  { key: 'waterSecurity', label: tr('Water', 'Eau') },
  { key: 'climateMatch', label: tr('Climate', 'Climat') },
  { key: 'soilFertility', label: tr('Soil', 'Sol') },
  { key: 'foodDiversification', label: tr('Diversity', 'Diversité') },
  { key: 'fcfaMargin', label: tr('Margin', 'Marge') },
]);

const colors = ['#3f6b3a', '#b07d2b', '#5a7d9a'];

const weightsModel = computed<ScoringWeights>({
  get: () => farmStore.weights,
  set: (v) => farmStore.setWeights({ ...v }),
});

const totalWeight = computed(() => {
  const w = farmStore.weights;
  return w.waterSecurity + w.fcfaMargin + w.soilFertility + w.foodSecurity;
});

const ranked = computed(() =>
  [...farmStore.scenarios]
    .map((s) => ({ scenario: s, score: farmStore.calculateWeightedScore(s) }))
    .sort((a, b) => b.score - a.score),
);

const center = 130;
const radius = 96;
const pointFor = (index: number, value: number) => {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
  return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
};

const polygonFor = (s: RotationScenario) =>
  axes.value
    .map((axis, i) => pointFor(i, (s.radarScores as unknown as Record<string, number>)[axis.key] || 0))
    .join(' ');

const gridRings = [25, 50, 75, 100].map((pct) =>
  axes.value.map((_, i) => pointFor(i, pct)).join(' '),
);

const axisEnds = axes.value.map((_, i) => pointFor(i, 100).split(',').map(Number));

const fmtFcfa = (v: number) =>
  new Intl.NumberFormat(appStore.language === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 0 }).format(v);

const slider = (key: keyof ScoringWeights, label: string, icon: string) => ({ key, label, icon });

const sliders = computed(() => [
  slider('waterSecurity', tr('Water security', 'Sécurité hydrique'), 'water_drop'),
  slider('fcfaMargin', tr('Net margin', 'Marge nette'), 'payments'),
  slider('soilFertility', tr('Soil fertility', 'Fertilité du sol'), 'compost'),
  slider('foodSecurity', tr('Food diversification', 'Diversification alimentaire'), 'nutrition'),
]);

const hasScenarios = computed(() => farmStore.scenarios.length > 0);
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md tracking-wider uppercase mb-1">
          <span class="material-symbols-outlined text-[18px]">tune</span>
          <span>{{ tr('Decision support', 'Aide à la décision') }}</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">{{ appStore.t('nav.decision') }}</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
          {{ tr('Weight what matters for your farm: the ranking recomputes instantly from the live rotation scores.', 'Pondérez ce qui compte pour votre ferme : le classement se recalcule instantanément à partir des scores réels.') }}
        </p>
      </div>
      <AppBadge variant="satellite" icon="insights">{{ tr('Live scoring', 'Notation en direct') }}</AppBadge>
    </div>

    <div v-if="farmStore.loadingTelemetry" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
      <span class="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
      <p class="font-body-md text-caption text-on-surface-variant mt-2">{{ tr('Computing rotations…', 'Calcul des rotations…') }}</p>
    </div>

    <div v-else-if="!hasScenarios" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-primary text-[32px]">rule</span>
      <p class="font-body-md text-caption text-on-surface-variant">
        {{ tr('No rotation can be scored yet: add a plot and let the NASA telemetry load.', 'Aucune rotation ne peut encore être notée : ajoutez une parcelle et laissez charger la télémétrie NASA.') }}
      </p>
      <AppButton variant="primary" size="sm" icon="add_location_alt" @click="router.push('/exploitation')">{{ tr('Go to my plots', 'Mes parcelles') }}</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Weights + radar -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Your priorities', 'Vos priorités') }}</h2>
            <button type="button" class="font-caption text-caption text-primary hover:underline cursor-pointer" @click="farmStore.resetWeights()">
              {{ tr('Reset', 'Réinitialiser') }}
            </button>
          </div>

          <div v-for="s in sliders" :key="s.key" class="space-y-1">
            <div class="flex items-center justify-between font-label-md text-label-md">
              <span class="flex items-center gap-1.5 text-on-surface">
                <span class="material-symbols-outlined text-[18px] text-primary">{{ s.icon }}</span>
                {{ s.label }}
              </span>
              <strong class="text-primary">{{ weightsModel[s.key] }}%</strong>
            </div>
            <input v-model.number="weightsModel[s.key]" type="range" min="0" max="100" step="5" class="w-full accent-primary cursor-pointer" />
          </div>

          <p :class="['text-caption font-caption', totalWeight === 100 ? 'text-on-surface-variant' : 'text-error']">
            {{ tr('Total', 'Total') }} : {{ totalWeight }}%
            <span v-if="totalWeight !== 100"> — {{ tr('scores are normalised to this total', 'les scores sont normalisés sur ce total') }}</span>
          </p>
        </div>

        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-2">
          <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Profile comparison', 'Comparaison des profils') }}</h2>
          <svg viewBox="0 0 260 260" class="w-full max-w-[300px] mx-auto overflow-visible">
            <polygon v-for="(ring, i) in gridRings" :key="`ring-${i}`" :points="ring" fill="none" stroke="currentColor" stroke-opacity="0.15" />
            <line
              v-for="(end, i) in axisEnds"
              :key="`axis-${i}`"
              :x1="center"
              :y1="center"
              :x2="end[0]"
              :y2="end[1]"
              stroke="currentColor"
              stroke-opacity="0.15"
            />
            <polygon
              v-for="(s, i) in farmStore.scenarios"
              :key="s.id"
              :points="polygonFor(s)"
              :fill="colors[i % colors.length]"
              fill-opacity="0.18"
              :stroke="colors[i % colors.length]"
              stroke-width="2"
            />
            <text
              v-for="(axis, i) in axes"
              :key="`label-${i}`"
              :x="center + (axisEnds[i][0] - center) * 1.12"
              :y="center + (axisEnds[i][1] - center) * 1.12"
              text-anchor="middle"
              dominant-baseline="middle"
              class="fill-current text-[10px] font-semibold"
            >
              {{ axis.label }}
            </text>
          </svg>

          <div class="flex flex-wrap gap-3 justify-center pt-1">
            <span v-for="(s, i) in farmStore.scenarios" :key="`legend-${s.id}`" class="flex items-center gap-1.5 font-caption text-caption text-on-surface-variant">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: colors[i % colors.length] }"></span>
              {{ tr('Scenario', 'Scénario') }} {{ s.tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ranking -->
      <div class="lg:col-span-7 space-y-3">
        <div class="flex items-center justify-between px-1">
          <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Ranking with your weights', 'Classement selon vos pondérations') }}</h2>
          <span class="font-caption text-caption text-on-surface-variant">{{ farmStore.scenarios.length }} {{ tr('rotations', 'rotations') }}</span>
        </div>

        <div
          v-for="({ scenario, score }, index) in ranked"
          :key="scenario.id"
          class="bg-surface-container-lowest rounded-2xl border shadow-xs p-4 sm:p-5 space-y-3"
          :class="index === 0 ? 'border-primary ring-1 ring-primary/30' : 'border-outline-variant/30'"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 min-w-0">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center font-body-bold text-label-lg shrink-0"
                :class="index === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'"
              >
                {{ scenario.tag }}
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-body-bold text-label-lg text-on-surface">{{ tr('Scenario', 'Scénario') }} {{ scenario.tag }}</h3>
                  <AppBadge v-if="index === 0" variant="primary" icon="workspace_premium">{{ tr('Best for you', 'Meilleur pour vous') }}</AppBadge>
                  <AppBadge v-if="scenario.isRecommended" variant="secondary" icon="science">{{ tr('Engine pick', 'Choix du moteur') }}</AppBadge>
                </div>
                <p class="font-caption text-caption text-on-surface-variant mt-0.5 truncate">{{ scenario.name }}</p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="font-headline-sm text-headline-sm font-bold" :class="index === 0 ? 'text-primary' : 'text-on-surface'">{{ score }}<span class="text-caption font-normal text-on-surface-variant">/100</span></p>
              <p class="font-caption text-[11px] text-on-surface-variant">{{ tr('engine', 'moteur') }} {{ scenario.overallScore }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div v-for="axis in axes" :key="axis.key" class="p-2 rounded-lg bg-surface-container-low">
              <p class="font-caption text-[11px] text-on-surface-variant">{{ axis.label }}</p>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="font-body-bold text-caption text-on-surface">
                  {{ Math.round((scenario.radarScores as unknown as Record<string, number>)[axis.key] || 0) }}
                </span>
                <div class="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div class="h-full rounded-full bg-primary" :style="{ width: `${(scenario.radarScores as unknown as Record<string, number>)[axis.key] || 0}%` }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-on-surface-variant">
            <span>{{ tr('Margin', 'Marge') }} : <strong class="text-on-surface">{{ fmtFcfa(scenario.netMarginFcfaHa) }} FCFA/ha</strong></span>
            <span>{{ tr('Water stress', 'Stress hydrique') }} : <strong class="text-on-surface">{{ scenario.waterStressPercent }}%</strong></span>
            <span>{{ tr('Failure risk', 'Risque d’échec') }} : <strong class="text-on-surface">{{ scenario.failureRiskPercent }}%</strong></span>
          </div>

          <div class="flex gap-2">
            <AppButton variant="primary" size="sm" icon="open_in_new" @click="router.push(`/detail/${scenario.id}`)">
              {{ tr('Open the sheet', 'Ouvrir la fiche') }}
            </AppButton>
            <AppButton variant="secondary" size="sm" icon="compare_arrows" @click="router.push('/scenarios')">
              {{ tr('Compare', 'Comparer') }}
            </AppButton>
          </div>
        </div>

        <p class="font-caption text-caption text-center text-on-surface-variant pt-2">
          {{ tr('Indicative estimation, not a yield forecast.', 'Estimation indicative, pas une prévision de rendement.') }}
        </p>
      </div>
    </div>
  </div>
</template>
