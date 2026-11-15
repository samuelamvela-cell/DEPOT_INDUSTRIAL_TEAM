<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const route = useRoute();
const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const scenario = computed(() => farmStore.scenarios.find((s) => s.id === route.params.id) || null);
const plot = computed(() => farmStore.activePlot);

const cropLabel = (crop: { name: string; nameFr?: string }) =>
  appStore.language === 'fr' && crop.nameFr ? crop.nameFr : crop.name;

const fmt = (v: number) =>
  new Intl.NumberFormat(appStore.language === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 0 }).format(v);

const riskClass = (risk: string) =>
  risk === 'eleve' ? 'text-error' : risk === 'modere' ? 'text-tertiary' : 'text-primary';

const radarRows = computed(() => {
  const s = scenario.value;
  if (!s) return [];
  return [
    { label: tr('Water security', 'Sécurité hydrique'), value: s.radarScores.waterSecurity },
    { label: tr('Climate match', 'Adéquation climatique'), value: s.radarScores.climateMatch },
    { label: tr('Soil fertility', 'Fertilité du sol'), value: s.radarScores.soilFertility },
    { label: tr('Diversification', 'Diversification'), value: s.radarScores.foodDiversification },
    { label: tr('Net margin', 'Marge nette'), value: s.radarScores.fcfaMargin },
  ];
});

const margins = computed(() => {
  const s = scenario.value;
  if (!s || !plot.value) return null;
  return {
    perHa: s.netMarginFcfaHa,
    perPlot: s.totalIncomePlotFcfa,
    surface: plot.value.surfaceHa,
  };
});
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">
    <button type="button" class="inline-flex items-center gap-1 font-label-md text-caption text-primary hover:underline cursor-pointer" @click="router.push('/decision')">
      <span class="material-symbols-outlined text-[18px]">arrow_back</span>
      {{ tr('Back to decision', 'Retour à la décision') }}
    </button>

    <div v-if="!scenario" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-primary text-[32px]">search_off</span>
      <p class="font-body-md text-caption text-on-surface-variant">
        {{ tr('This rotation is no longer available. It may depend on crops or telemetry that changed.', 'Cette rotation n’est plus disponible : elle dépend peut-être de cultures ou de télémétrie modifiées.') }}
      </p>
      <AppButton variant="primary" size="sm" icon="arrow_back" @click="router.push('/decision')">{{ tr('Back', 'Retour') }}</AppButton>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-5 sm:p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <AppBadge variant="primary">{{ tr('Scenario', 'Scénario') }} {{ scenario.tag }}</AppBadge>
              <AppBadge v-if="scenario.isRecommended" variant="secondary" icon="workspace_premium">{{ tr('Engine recommendation', 'Recommandation du moteur') }}</AppBadge>
            </div>
            <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">{{ scenario.name }}</h1>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">{{ scenario.subtitle }}</p>
            <p v-if="plot" class="font-caption text-caption text-on-surface-variant">
              {{ plot.name }} · {{ plot.code }} · {{ plot.surfaceHa }} ha
            </p>
          </div>
          <div class="text-center shrink-0 bg-surface-container-low rounded-xl px-5 py-3">
            <p class="font-headline-lg text-headline-lg font-bold text-primary">{{ scenario.overallScore }}</p>
            <p class="font-caption text-[11px] text-on-surface-variant">{{ tr('score /100', 'note /100') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Net margin / ha', 'Marge nette / ha') }}</p>
            <p class="font-body-bold text-label-lg text-primary">{{ fmt(scenario.netMarginFcfaHa) }}</p>
            <p class="font-caption text-[10px] text-on-surface-variant">FCFA</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Nitrogen balance', 'Bilan azoté') }}</p>
            <p :class="['font-body-bold text-label-lg', scenario.nitrogenBalanceKgHa >= 0 ? 'text-primary' : 'text-error']">
              {{ scenario.nitrogenBalanceKgHa > 0 ? '+' : '' }}{{ Math.round(scenario.nitrogenBalanceKgHa) }}
            </p>
            <p class="font-caption text-[10px] text-on-surface-variant">kg N/ha</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Water stress', 'Stress hydrique') }}</p>
            <p class="font-body-bold text-label-lg text-tertiary">{{ scenario.waterStressPercent }}%</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Failure risk', 'Risque d’échec') }}</p>
            <p class="font-body-bold text-label-lg text-on-surface">{{ scenario.failureRiskPercent }}%</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Phases -->
        <div class="lg:col-span-7 space-y-3">
          <h2 class="font-headline-sm text-headline-sm text-on-surface px-1">{{ tr('Rotation plan', 'Plan de rotation') }}</h2>

          <div
            v-for="phase in scenario.phases"
            :key="phase.seasonIndex"
            class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs p-4 sm:p-5 space-y-3"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 min-w-0">
                <div class="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center font-body-bold text-caption text-on-surface shrink-0">
                  {{ phase.seasonIndex }}
                </div>
                <div class="min-w-0">
                  <h3 class="font-body-bold text-label-lg text-on-surface truncate">{{ cropLabel(phase.crop) }}</h3>
                  <p class="font-caption text-caption text-on-surface-variant">
                    {{ phase.seasonName }} · {{ phase.seasonPeriod }} · {{ phase.crop.variety }}
                  </p>
                </div>
              </div>
              <img :src="phase.crop.imageUrl" :alt="cropLabel(phase.crop)" class="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" />
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-caption">
              <div class="p-2 rounded-lg bg-surface-container-low">
                <p class="text-[11px] text-on-surface-variant">{{ tr('Planned yield', 'Rendement prévu') }}</p>
                <p class="font-body-bold text-on-surface">{{ phase.plannedYieldTonnesHa.toFixed(1) }} t/ha</p>
              </div>
              <div class="p-2 rounded-lg bg-surface-container-low">
                <p class="text-[11px] text-on-surface-variant">{{ tr('Gross margin', 'Marge brute') }}</p>
                <p class="font-body-bold text-on-surface">{{ fmt(phase.grossMarginFcfaHa) }}</p>
              </div>
              <div class="p-2 rounded-lg bg-surface-container-low">
                <p class="text-[11px] text-on-surface-variant">{{ tr('Water adequacy', 'Adéquation eau') }}</p>
                <p class="font-body-bold text-on-surface">{{ phase.waterAdequacyPercent }}%</p>
              </div>
              <div class="p-2 rounded-lg bg-surface-container-low">
                <p class="text-[11px] text-on-surface-variant">{{ tr('Disease risk', 'Risque maladie') }}</p>
                <p :class="['font-body-bold', riskClass(phase.diseaseBreakRisk)]">{{ phase.diseaseBreakRisk }}</p>
              </div>
            </div>

            <p v-if="phase.notes" class="font-caption text-caption text-on-surface-variant bg-surface-container-low rounded-lg px-3 py-2">
              {{ phase.notes }}
            </p>
          </div>
        </div>

        <!-- Right column -->
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-5 space-y-3">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Score breakdown', 'Détail du score') }}</h2>
            <div v-for="row in radarRows" :key="row.label" class="space-y-1">
              <div class="flex items-center justify-between font-label-md text-caption">
                <span class="text-on-surface-variant">{{ row.label }}</span>
                <strong class="text-on-surface">{{ Math.round(row.value) }}</strong>
              </div>
              <div class="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                <div class="h-full rounded-full bg-primary" :style="{ width: `${Math.max(0, Math.min(100, row.value))}%` }"></div>
              </div>
            </div>
          </div>

          <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-5 space-y-3">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('What stands out', 'Points clés') }}</h2>
            <ul class="space-y-1.5">
              <li v-for="(s, i) in scenario.scoreExplanation.strengths" :key="`s-${i}`" class="flex items-start gap-2 font-caption text-caption text-on-surface-variant">
                <span class="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                <span>{{ s }}</span>
              </li>
              <li v-for="(w, i) in scenario.scoreExplanation.weaknesses" :key="`w-${i}`" class="flex items-start gap-2 font-caption text-caption text-on-surface-variant">
                <span class="material-symbols-outlined text-error text-[16px] mt-0.5">warning</span>
                <span>{{ w }}</span>
              </li>
            </ul>
          </div>

          <div v-if="margins" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-5 space-y-2">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Season totals', 'Totaux de campagne') }}</h2>
            <div class="flex items-center justify-between font-caption text-caption">
              <span class="text-on-surface-variant">{{ tr('Net margin for the whole plot', 'Marge nette pour la parcelle') }}</span>
              <strong class="text-on-surface">{{ fmt(margins.perPlot) }} FCFA</strong>
            </div>
            <div class="flex items-center justify-between font-caption text-caption">
              <span class="text-on-surface-variant">{{ tr('Surface used', 'Surface utilisée') }}</span>
              <strong class="text-on-surface">{{ margins.surface }} ha</strong>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <AppButton variant="secondary" icon="compare_arrows" :full-width="true" @click="router.push('/scenarios')">
              {{ tr('Compare with other rotations', 'Comparer aux autres rotations') }}
            </AppButton>
            <AppButton variant="outline" icon="tune" :full-width="true" @click="router.push('/decision')">
              {{ tr('Adjust my priorities', 'Ajuster mes priorités') }}
            </AppButton>
          </div>
        </div>
      </div>

      <p class="font-caption text-caption text-center text-on-surface-variant">
        {{ tr('Indicative estimation, not a yield forecast.', 'Estimation indicative, pas une prévision de rendement.') }}
      </p>
    </template>
  </div>
</template>
