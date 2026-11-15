<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import type { Crop } from '@/types';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppGauge from '@/components/common/AppGauge.vue';
import AppModal from '@/components/common/AppModal.vue';

const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const activeTab = ref<string>('scenario_a');

const currentScenario = computed(
  () => farmStore.scenarios.find((s) => s.id === activeTab.value) || farmStore.scenarios[0] || null,
);

watch(
  () => farmStore.scenarios,
  (list) => {
    if (list.length && !list.some((s) => s.id === activeTab.value)) activeTab.value = list[0].id;
  },
);

const showCropModal = ref(false);
const editingPhaseIndex = ref<number | null>(null);

const openCropSelector = (index: number) => {
  editingPhaseIndex.value = index;
  showCropModal.value = true;
};

const assignCrop = (crop: Crop) => {
  if (currentScenario.value && editingPhaseIndex.value !== null) {
    farmStore.setPhaseCrop(currentScenario.value.id, editingPhaseIndex.value, crop.id);
  }
  showCropModal.value = false;
};

const cropLabel = (crop: Crop) => (appStore.language === 'fr' && crop.nameFr ? crop.nameFr : crop.name);

const goToDecision = () => router.push('/decision');
const goToDetail = (id: string) => router.push(`/detail/${id}`);
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1 max-w-3xl">
        <div class="flex items-center gap-2 text-tertiary font-label-md text-label-md uppercase tracking-wider">
          <span class="material-symbols-outlined text-[18px]">satellite_alt</span>
          <span>{{ tr('NASA POWER telemetry × IRAD rotation rules', 'Télémétrie NASA POWER × règles de rotation IRAD') }}</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          {{ tr('Rotation builder', 'Constructeur de rotation') }}
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant">
          {{
            tr(
              'Three seasons generated from your plot, the live water balance and the reference catalogue. Swap a crop and the score is recomputed.',
              'Trois saisons générées depuis votre parcelle, le bilan hydrique en direct et le catalogue de référence. Changez une culture et le score est recalculé.',
            )
          }}
        </p>
      </div>

      <div v-if="farmStore.activePlot" class="flex items-center gap-2 bg-surface-container-high px-4 py-2 rounded-xl text-on-surface self-start lg:self-auto">
        <span class="material-symbols-outlined text-primary text-[20px]">layers</span>
        <span class="font-label-lg text-label-lg">
          {{ farmStore.activePlot.name }} • {{ farmStore.activePlot.soilType }}
        </span>
      </div>
    </div>

    <!-- Loading / empty -->
    <div v-if="farmStore.loadingTelemetry" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
      <span class="material-symbols-outlined animate-spin text-[30px] text-primary">progress_activity</span>
      <p class="font-body-md text-caption text-on-surface-variant mt-2">{{ tr('Building rotations from live telemetry…', 'Construction des rotations à partir de la télémétrie…') }}</p>
    </div>

    <div v-else-if="farmStore.telemetryError" class="bg-error-container/30 border border-error/40 rounded-2xl p-5 space-y-2">
      <p class="font-body-bold text-label-lg text-error">{{ tr('Telemetry unavailable', 'Télémétrie indisponible') }}</p>
      <p class="font-caption text-caption text-on-surface-variant">{{ farmStore.telemetryError }}</p>
      <AppButton variant="secondary" size="sm" icon="refresh" @click="farmStore.loadTelemetry(true)">{{ tr('Retry', 'Réessayer') }}</AppButton>
    </div>

    <div v-else-if="!farmStore.scenarios.length" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-primary text-[36px]">add_location_alt</span>
      <p class="font-body-md text-caption text-on-surface-variant">
        {{ tr('Rotations need a plot, the crop catalogue and NASA telemetry. Add a plot first.', 'Les rotations nécessitent une parcelle, le catalogue et la télémétrie NASA. Ajoutez d’abord une parcelle.') }}
      </p>
      <RouterLink to="/onboarding" class="font-body-bold text-caption text-primary hover:underline">{{ tr('Create a plot', 'Créer une parcelle') }}</RouterLink>
    </div>

    <template v-else>
      <!-- Scenario pills -->
      <div class="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div class="flex items-center gap-3 min-w-max">
          <button
            v-for="s in farmStore.scenarios"
            :key="s.id"
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left cursor-pointer border',
              activeTab === s.id
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:bg-surface-container-high shadow-xs',
            ]"
            @click="activeTab = s.id"
          >
            <span :class="['w-2.5 h-2.5 rounded-full', s.isRecommended ? 'bg-secondary-container' : 'bg-outline-variant']"></span>
            <div>
              <span :class="['font-label-md text-caption block uppercase tracking-wide', activeTab === s.id ? 'text-primary-fixed' : 'text-on-surface-variant']">
                {{ s.isRecommended ? tr('Recommended', 'Recommandé') : `${tr('Option', 'Option')} ${s.tag}` }}
              </span>
              <span class="font-body-bold text-label-lg">{{ s.name }}</span>
            </div>
            <span v-if="s.isRecommended" class="material-symbols-outlined text-[18px] ml-1 opacity-80">star</span>
          </button>
        </div>

        <div class="hidden xl:flex items-center gap-2 text-on-surface-variant font-caption text-caption shrink-0">
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>{{ tr('Recalculated on every change', 'Recalculé à chaque modification') }}</span>
        </div>
      </div>

      <div v-if="currentScenario" class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Timeline -->
        <div class="lg:col-span-8 space-y-4">
          <div class="flex items-center justify-between bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/30">
            <div class="flex items-center gap-2 text-primary">
              <span class="material-symbols-outlined text-[20px]">timeline</span>
              <span class="font-body-bold text-label-lg">{{ tr('3-phase rotation', 'Rotation en 3 phases') }}</span>
            </div>
            <button
              v-if="farmStore.overrides[currentScenario.id]"
              type="button"
              class="font-caption text-caption text-secondary hover:underline cursor-pointer"
              @click="farmStore.resetOverride(currentScenario.id)"
            >
              {{ tr('Reset to catalogue default', 'Réinitialiser au catalogue') }}
            </button>
          </div>

          <div class="space-y-4">
            <div
              v-for="(phase, idx) in currentScenario.phases"
              :key="idx"
              class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-3"
            >
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
                <div class="flex items-center gap-3">
                  <span class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-body-bold text-label-lg shrink-0">
                    {{ idx + 1 }}
                  </span>
                  <div>
                    <span class="font-label-md text-caption text-tertiary uppercase tracking-wider block">
                      {{ phase.seasonPeriod }} · {{ phase.seasonName }}
                    </span>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface">
                      {{ cropLabel(phase.crop) }} <span class="font-caption text-on-surface-variant">({{ phase.crop.variety }})</span>
                    </h3>
                  </div>
                </div>
                <AppBadge variant="satellite" icon="radar">{{ phase.waterAdequacyPercent }}% {{ tr('water adequacy', 'adéquation hydrique') }}</AppBadge>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="md:col-span-1 rounded-xl overflow-hidden h-36 bg-surface-container relative">
                  <img :src="phase.crop.imageUrl" :alt="cropLabel(phase.crop)" class="w-full h-full object-cover" loading="lazy" />
                  <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-inverse-surface/80 text-inverse-on-surface text-[10px] rounded backdrop-blur-sm">
                    {{ phase.crop.family.toUpperCase() }} · {{ phase.crop.cycleDays }} {{ tr('days', 'jours') }}
                  </div>
                </div>

                <div class="md:col-span-2 bg-surface-container-low p-3.5 rounded-xl flex flex-col justify-between space-y-2">
                  <p class="font-body-md text-caption sm:text-body-md text-on-surface">{{ phase.notes }}</p>

                  <div class="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/20 text-center">
                    <div>
                      <span class="font-caption text-[11px] text-on-surface-variant block">{{ tr('Target yield', 'Rendement visé') }}</span>
                      <span class="font-body-bold text-label-md text-primary">{{ phase.plannedYieldTonnesHa }} t/ha</span>
                    </div>
                    <div>
                      <span class="font-caption text-[11px] text-on-surface-variant block">{{ tr('Gross margin', 'Marge brute') }}</span>
                      <span class="font-body-bold text-label-md text-secondary">{{ phase.grossMarginFcfaHa.toLocaleString('fr-FR') }} FCFA</span>
                    </div>
                    <div>
                      <span class="font-caption text-[11px] text-on-surface-variant block">{{ tr('Soil nitrogen', 'Azote du sol') }}</span>
                      <span :class="['font-body-bold text-label-md', phase.crop.nitrogenFixationKgHa > 0 ? 'text-primary' : 'text-error']">
                        {{ phase.crop.nitrogenFixationKgHa > 0 ? `+${phase.crop.nitrogenFixationKgHa}` : phase.crop.nitrogenFixationKgHa }} kg N
                      </span>
                    </div>
                  </div>

                  <div class="flex justify-end pt-1">
                    <button
                      type="button"
                      class="font-body-bold text-caption text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      @click="openCropSelector(idx)"
                    >
                      <span class="material-symbols-outlined text-[16px]">edit</span>
                      <span>{{ tr('Swap this crop', 'Changer cette culture') }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Scenario summary', 'Bilan du scénario') }}</h3>
              <AppBadge v-if="currentScenario.isRecommended" variant="secondary" icon="star">{{ tr('Recommended', 'Recommandé') }}</AppBadge>
            </div>

            <div class="p-4 bg-surface-container-low rounded-xl flex items-center justify-center">
              <AppGauge
                :score="currentScenario.overallScore"
                size="lg"
                :label="tr('Resilience index', 'Indice de résilience')"
                :sublabel="currentScenario.overallScore >= 80 ? tr('Balanced & profitable', 'Équilibré & rentable') : tr('Watch the water stress', 'Attention au stress hydrique')"
              />
            </div>

            <div class="space-y-2.5 pt-1 text-label-md">
              <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
                <span class="text-on-surface-variant">{{ tr('Net margin', 'Marge nette') }}</span>
                <span class="font-body-bold text-label-lg text-secondary">{{ currentScenario.netMarginFcfaHa.toLocaleString('fr-FR') }} FCFA/ha</span>
              </div>
              <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
                <span class="text-on-surface-variant">
                  {{ tr('Plot income', 'Revenu de la parcelle') }} ({{ farmStore.activePlot?.surfaceHa ?? 1 }} ha)
                </span>
                <span class="font-body-bold text-label-lg text-on-surface">{{ currentScenario.totalIncomePlotFcfa.toLocaleString('fr-FR') }} FCFA</span>
              </div>
              <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
                <span class="text-on-surface-variant">{{ tr('Nitrogen balance', 'Bilan azoté') }}</span>
                <span :class="['font-body-bold text-label-lg flex items-center gap-1', currentScenario.nitrogenBalanceKgHa > 0 ? 'text-primary' : 'text-error']">
                  <span class="material-symbols-outlined text-[16px]">{{ currentScenario.nitrogenBalanceKgHa > 0 ? 'trending_up' : 'trending_down' }}</span>
                  {{ currentScenario.nitrogenBalanceKgHa > 0 ? `+${currentScenario.nitrogenBalanceKgHa}` : currentScenario.nitrogenBalanceKgHa }} kg N/ha
                </span>
              </div>
              <div class="flex justify-between items-baseline py-1 border-b border-outline-variant/20">
                <span class="text-on-surface-variant">{{ tr('Water stress risk', 'Risque hydrique') }}</span>
                <span :class="['font-body-bold text-label-lg', currentScenario.waterStressPercent <= 20 ? 'text-primary' : 'text-error']">
                  {{ currentScenario.waterStressPercent }}%
                </span>
              </div>
              <div class="flex justify-between items-baseline py-1">
                <span class="text-on-surface-variant">{{ tr('Failure risk', 'Risque d’échec') }}</span>
                <span class="font-body-bold text-label-lg text-on-surface">{{ currentScenario.failureRiskPercent }}%</span>
              </div>
            </div>

            <div class="space-y-2 pt-2">
              <AppButton variant="primary" size="lg" :full-width="true" icon="balance" @click="goToDecision">
                {{ tr('Compare on the radar', 'Comparer sur le radar') }}
              </AppButton>
              <AppButton variant="secondary" size="md" :full-width="true" icon="visibility" @click="goToDetail(currentScenario.id)">
                {{ tr('Full scenario detail', 'Détail complet du scénario') }}
              </AppButton>
            </div>
          </div>

          <p class="font-caption text-caption text-center text-on-surface-variant">
            {{ appStore.t('app.disclaimer') }}
          </p>
        </div>
      </div>
    </template>

    <AppModal v-model="showCropModal" :title="tr('Pick a crop for this phase', 'Choisir une culture pour cette phase')">
      <div class="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
        <div
          v-for="c in farmStore.crops"
          :key="c.id"
          class="p-3 rounded-xl bg-surface-container-low hover:bg-surface-container flex items-center justify-between cursor-pointer transition-colors gap-3"
          @click="assignCrop(c)"
        >
          <div class="min-w-0">
            <p class="font-body-bold text-label-lg text-on-surface truncate">{{ cropLabel(c) }}</p>
            <p class="font-caption text-caption text-primary">
              {{ c.variety }} • {{ c.cycleDays }} {{ tr('days', 'jours') }} • {{ c.waterNeedMm }} mm
            </p>
          </div>
          <span
            :class="[
              'px-2 py-0.5 rounded-full text-caption font-semibold whitespace-nowrap',
              c.nitrogenFixationKgHa > 0 ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-surface-container text-on-surface-variant',
            ]"
          >
            {{ c.nitrogenFixationKgHa > 0 ? `+${c.nitrogenFixationKgHa}` : c.nitrogenFixationKgHa }} kg N
          </span>
        </div>
      </div>
    </AppModal>
  </div>
</template>
