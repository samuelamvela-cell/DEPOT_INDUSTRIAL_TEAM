<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import AppCard from '@/components/common/AppCard.vue';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const farmStore = useFarmStore();
const auth = useAuthStore();
const appStore = useAppStore();
const tr = appStore.tr;

const plot = computed(() => farmStore.activePlot);
const climate = computed(() => farmStore.telemetry);
const recommended = computed(() => farmStore.recommendedScenario);

const navigateTo = (path: string) => router.push(path);

const monthName = (month: number) => {
  const names =
    appStore.language === 'fr'
      ? ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
      : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month - 1] || '';
};

const seedingWindowLabel = computed(() => {
  const w = climate.value?.nextSeedingWindow;
  if (!w) return null;
  const start = new Date(w.start);
  const end = new Date(w.end);
  return `${start.getUTCDate()} – ${end.getUTCDate()} ${monthName(end.getUTCMonth() + 1)} ${end.getUTCFullYear()}`;
});

const anomaly = computed(() => climate.value?.rainfallAnomalyPercent ?? null);
const fmt = (v: number | null | undefined, digits = 0) =>
  v === null || v === undefined ? '—' : Number(v).toFixed(digits);
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="space-y-1.5">
        <div class="flex items-center gap-2 flex-wrap">
          <AppBadge variant="success" :pulse="!!climate">
            {{ climate ? tr('Live NASA POWER data', 'Données NASA POWER en direct') : tr('Awaiting telemetry', 'Télémétrie en attente') }}
          </AppBadge>
          <AppBadge v-if="plot" variant="satellite" icon="pin_drop">{{ plot.code }}</AppBadge>
        </div>
        <h1 class="font-display-lg text-headline-lg lg:text-display-lg text-on-surface tracking-tight">
          {{ tr(`Hello ${auth.firstName || 'there'}, ready to plan the next rotation?`, `Bonjour ${auth.firstName || ''}, prêt à planifier la prochaine rotation ?`) }}
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant max-w-3xl">
          {{
            tr(
              'Every figure below is computed from your plot coordinates, the NASA POWER API and the IRAD crop reference catalogue.',
              'Chaque chiffre ci-dessous est calculé à partir des coordonnées de votre parcelle, de l’API NASA POWER et du catalogue de référence IRAD.',
            )
          }}
        </p>
      </div>

      <div class="hidden xl:flex flex-col items-end text-right bg-surface-container-lowest p-4 rounded-2xl shadow-xs min-w-[220px] border border-outline-variant/20">
        <span class="font-caption text-caption text-on-surface-variant uppercase tracking-wider">{{ appStore.t('dashboard.agroZone') }}</span>
        <span class="font-headline-sm text-headline-sm text-primary font-bold">{{ appStore.t(appStore.activeRegion.zoneKey) }}</span>
        <span class="font-label-md text-label-md text-on-surface-variant mt-0.5">
          {{ plot ? plot.coordinates.region : appStore.t(appStore.regionKey) }} • {{ plot ? `${plot.coordinates.lat.toFixed(3)}°, ${plot.coordinates.lng.toFixed(3)}°` : appStore.activeRegion.lat + '°, ' + appStore.activeRegion.lng + '°' }}
        </span>
      </div>
    </div>

    <!-- No plot yet -->
    <div
      v-if="!plot"
      class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8 text-center space-y-4"
    >
      <span class="material-symbols-outlined text-primary text-[42px]">add_location_alt</span>
      <h2 class="font-headline-sm text-headline-sm text-on-surface">
        {{ tr('No plot registered yet', 'Aucune parcelle enregistrée') }}
      </h2>
      <p class="font-body-md text-caption text-on-surface-variant max-w-xl mx-auto">
        {{
          tr(
            'Add your first plot so AgroPredict can pull NASA POWER rainfall, soil wetness and temperature for your exact coordinates.',
            'Ajoutez votre première parcelle pour qu’AgroPredict récupère les pluies, l’humidité du sol et la température NASA POWER à vos coordonnées exactes.',
          )
        }}
      </p>
      <AppButton variant="primary" icon="add" @click="navigateTo('/onboarding')">
        {{ tr('Create my first plot', 'Créer ma première parcelle') }}
      </AppButton>
    </div>

    <template v-else>
      <!-- Plot + telemetry -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Plot card -->
        <div class="lg:col-span-5 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-primary/5 pointer-events-none"></div>

          <div class="space-y-4 relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[24px]">verified</span>
                <span class="font-label-md text-label-md text-primary font-semibold uppercase tracking-wider">
                  {{ appStore.t('dashboard.selectedPlot') }}
                </span>
              </div>
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-caption">
                {{ plot.code }}
              </span>
            </div>

            <div>
              <h2 class="font-headline-md text-headline-md text-on-surface">{{ plot.name }}</h2>
              <p class="font-caption text-caption text-on-surface-variant mt-0.5">
                {{ plot.cooperativeName || tr('Independent farm', 'Exploitation indépendante') }} • {{ plot.coordinates.locality }}
              </p>
            </div>

            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
                <span class="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">straighten</span> {{ appStore.t('dashboard.surface') }}
                </span>
                <span class="font-headline-sm text-headline-sm text-on-surface font-bold mt-1">{{ plot.surfaceHa }} ha</span>
                <span class="font-caption text-caption text-primary mt-0.5">{{ plot.coordinates.zoneAgroEcologique }}</span>
              </div>

              <div class="p-3 rounded-xl bg-surface-container-low flex flex-col">
                <span class="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                  <span class="material-symbols-outlined text-[15px]">compost</span> {{ appStore.t('dashboard.soilType') }}
                </span>
                <span class="font-body-bold text-label-lg text-on-surface mt-1 truncate">{{ plot.soilType }}</span>
                <span class="font-caption text-caption text-secondary mt-0.5">
                  pH {{ plot.soilPh }} • AWC {{ plot.availableWaterCapacityMm }} mm
                </span>
              </div>

              <div class="p-3 rounded-xl bg-surface-container-low flex flex-col col-span-2">
                <div class="flex items-center justify-between">
                  <span class="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                    <span class="material-symbols-outlined text-[15px]">history_edu</span> {{ appStore.t('dashboard.previousCrop') }}
                  </span>
                  <span class="font-label-md text-caption text-on-surface-variant">{{ plot.previousCrop.harvestDate || '—' }}</span>
                </div>
                <div class="flex items-center justify-between mt-1 gap-2">
                  <span class="font-body-bold text-label-lg text-on-surface truncate">
                    {{ plot.previousCrop.cropName || tr('Not recorded', 'Non renseignée') }}
                    <span v-if="plot.previousCrop.variety" class="font-caption text-on-surface-variant">({{ plot.previousCrop.variety }})</span>
                  </span>
                  <span class="text-caption font-caption bg-surface-container-highest px-2 py-0.5 rounded text-on-surface whitespace-nowrap">
                    {{ plot.previousCrop.yieldTonnesHa || 0 }} t/ha
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-4 mt-2 flex items-center justify-between border-t border-outline-variant/20 relative z-10">
            <RouterLink to="/exploitation" class="inline-flex items-center gap-1.5 font-body-bold text-label-lg text-primary hover:text-primary-container transition-colors min-h-[48px]">
              <span>{{ tr('Open the farm register', 'Ouvrir le registre de la ferme') }}</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </RouterLink>
            <button
              class="w-11 h-11 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center hover:bg-surface-variant transition-colors cursor-pointer"
              :title="tr('Edit plot', 'Modifier la parcelle')"
              type="button"
              @click="navigateTo('/exploitation')"
            >
              <span class="material-symbols-outlined text-[20px]">edit_location_alt</span>
            </button>
          </div>
        </div>

        <!-- Telemetry -->
        <div class="lg:col-span-7 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-5 sm:p-6 flex flex-col justify-between">
          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-tertiary text-[24px]">satellite</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">
                  {{ tr('Hydro-climatic indicators', 'Indicateurs hydro-climatiques') }}
                </h3>
              </div>
              <AppBadge v-if="climate" variant="satellite" icon="sensors">
                NASA POWER {{ climate.provenance.apiVersion }}
              </AppBadge>
            </div>

            <div v-if="farmStore.loadingTelemetry" class="p-6 text-center text-on-surface-variant font-body-md text-caption">
              <span class="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
              <p class="mt-2">{{ tr('Fetching NASA POWER telemetry…', 'Récupération de la télémétrie NASA POWER…') }}</p>
            </div>

            <div
              v-else-if="farmStore.telemetryError"
              class="p-4 rounded-xl bg-error-container/30 border border-error/40 space-y-2"
            >
              <p class="font-body-bold text-label-lg text-error">{{ tr('NASA POWER is unreachable', 'NASA POWER est injoignable') }}</p>
              <p class="font-caption text-caption text-on-surface-variant">{{ farmStore.telemetryError }}</p>
              <AppButton variant="secondary" size="sm" icon="refresh" @click="farmStore.loadTelemetry(true)">
                {{ tr('Retry', 'Réessayer') }}
              </AppButton>
            </div>

            <template v-else-if="climate">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Rain, last 7 days', 'Pluie, 7 derniers jours') }}</span>
                    <div class="flex items-baseline gap-1 mt-1">
                      <span class="font-display-lg text-headline-lg text-tertiary font-bold">{{ fmt(climate.rainfall7dMm, 1) }}</span>
                      <span class="font-label-lg text-label-lg text-on-surface">mm</span>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center gap-1 font-label-md text-caption" :class="anomaly !== null && anomaly < 0 ? 'text-secondary' : 'text-primary'">
                    <span class="material-symbols-outlined text-[16px]">{{ anomaly !== null && anomaly < 0 ? 'trending_down' : 'trending_up' }}</span>
                    <span>
                      {{ anomaly === null ? tr('No normal available', 'Normale indisponible') : `${anomaly > 0 ? '+' : ''}${anomaly}% ${tr('vs 25-year normal', 'vs normale 25 ans')}` }}
                    </span>
                  </div>
                </div>

                <div class="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Surface soil wetness', 'Humidité de surface') }}</span>
                    <div class="flex items-baseline gap-1 mt-1">
                      <span class="font-display-lg text-headline-lg text-primary font-bold">{{ fmt(climate.soilMoistureSurfacePercent) }}</span>
                      <span class="font-label-lg text-label-lg text-on-surface">%</span>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center gap-1 text-primary font-label-md text-caption">
                    <span class="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{{ tr('Root zone', 'Zone racinaire') }} {{ fmt(climate.soilMoistureRootPercent) }}%</span>
                  </div>
                </div>

                <div class="bg-surface-container-low p-4 rounded-xl flex flex-col justify-between">
                  <div>
                    <span class="font-caption text-caption text-on-surface-variant block">{{ tr('Air temperature (30 d)', 'Température de l’air (30 j)') }}</span>
                    <div class="flex items-baseline gap-1 mt-1">
                      <span class="font-display-lg text-headline-lg text-secondary font-bold">{{ fmt(climate.temperatureAvgC, 1) }}</span>
                      <span class="font-label-lg text-label-lg text-on-surface">°C</span>
                    </div>
                  </div>
                  <div class="mt-3 flex items-center gap-1 text-on-surface-variant font-label-md text-caption">
                    <span class="material-symbols-outlined text-[16px]">device_thermostat</span>
                    <span>{{ tr('Min', 'Min') }} {{ fmt(climate.temperatureMinC, 1) }} / {{ tr('Max', 'Max') }} {{ fmt(climate.temperatureMaxC, 1) }} °C</span>
                  </div>
                </div>
              </div>

              <div class="p-4 rounded-xl bg-primary-fixed/20 border border-primary-fixed flex items-start gap-3">
                <span class="material-symbols-outlined text-primary text-[24px] shrink-0 mt-0.5">tips_and_updates</span>
                <div>
                  <p class="font-body-bold text-label-lg text-primary">
                    {{ tr('Next sowing window', 'Prochaine fenêtre de semis') }}:
                    {{ seedingWindowLabel || tr('no onset found in the 25-year normal', 'aucune installation trouvée dans la normale 25 ans') }}
                  </p>
                  <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-0.5">
                    {{
                      tr(
                        `Derived from the 25-year POWER rainfall normal (${climate.nextSeedingWindow?.normalRainMm ?? '—'} mm expected in the onset month). Confirmed by local soil moisture at ${fmt(climate.soilMoistureSurfacePercent)}%.`,
                        `Calculée sur la normale pluviométrique POWER 25 ans (${climate.nextSeedingWindow?.normalRainMm ?? '—'} mm attendus le mois d’installation). Confirmée par l’humidité du sol locale à ${fmt(climate.soilMoistureSurfacePercent)}%.`,
                      )
                    }}
                  </p>
                </div>
              </div>

              <div
                v-if="climate.drySpell.warning"
                class="p-3 rounded-xl bg-secondary-fixed/30 border border-secondary/50 flex items-start gap-2"
              >
                <span class="material-symbols-outlined text-secondary text-[20px] shrink-0">wb_sunny</span>
                <p class="font-caption text-caption text-on-secondary-fixed">
                  {{
                    tr(
                      `Dry spell below ${climate.drySpell.thresholdMm} mm inside the wet season: months ${climate.drySpell.months.join(', ')}.`,
                      `Pause sèche sous ${climate.drySpell.thresholdMm} mm en saison des pluies : mois ${climate.drySpell.months.join(', ')}.`,
                    )
                  }}
                </p>
              </div>
            </template>
          </div>

          <div class="pt-4 mt-3 flex items-center justify-between border-t border-outline-variant/20">
            <RouterLink to="/climat" class="inline-flex items-center gap-1.5 font-body-bold text-label-lg text-tertiary hover:underline min-h-[48px]">
              <span>{{ tr('Full agro-climatic analysis', 'Analyse agro-climatique complète') }}</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </RouterLink>
            <AppBadge variant="neutral" icon="history">{{ tr('25-year baseline', 'Référence 25 ans') }}</AppBadge>
          </div>
        </div>
      </div>

      <!-- Recommended scenario -->
      <div v-if="recommended" class="bg-surface-container-lowest rounded-2xl border border-secondary-container shadow-sm p-5 sm:p-6 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary text-[22px]">star</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('dashboard.recommendedStrategy') }}</h3>
          </div>
          <span class="font-display-lg text-headline-md text-primary font-bold">{{ recommended.overallScore }}<span class="font-label-lg text-on-surface-variant">/100</span></span>
        </div>
        <p class="font-body-bold text-label-lg text-on-surface">{{ recommended.name }}</p>
        <p class="font-body-md text-caption text-on-surface-variant">{{ recommended.scoreExplanation.agronomicSummary }}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Net margin', 'Marge nette') }}</p>
            <p class="font-body-bold text-label-lg text-secondary">{{ recommended.netMarginFcfaHa.toLocaleString('fr-FR') }} FCFA/ha</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Nitrogen balance', 'Bilan azoté') }}</p>
            <p class="font-body-bold text-label-lg" :class="recommended.nitrogenBalanceKgHa >= 0 ? 'text-primary' : 'text-error'">
              {{ recommended.nitrogenBalanceKgHa > 0 ? '+' : '' }}{{ recommended.nitrogenBalanceKgHa }} kg N/ha
            </p>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Water stress risk', 'Risque hydrique') }}</p>
            <p class="font-body-bold text-label-lg text-on-surface">{{ recommended.waterStressPercent }}%</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-container-low">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Season income', 'Revenu de la parcelle') }}</p>
            <p class="font-body-bold text-label-lg text-on-surface">{{ recommended.totalIncomePlotFcfa.toLocaleString('fr-FR') }} FCFA</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 pt-1">
          <AppButton variant="primary" size="md" icon="balance" @click="navigateTo('/decision')">
            {{ tr('Compare all scenarios', 'Comparer tous les scénarios') }}
          </AppButton>
          <AppButton variant="secondary" size="md" icon="visibility" @click="navigateTo(`/detail/${recommended.id}`)">
            {{ tr('Open recommended plan', 'Ouvrir le plan recommandé') }}
          </AppButton>
        </div>
      </div>
      <div v-else-if="!farmStore.loadingTelemetry && !farmStore.telemetryError" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-5 text-center">
        <p class="font-body-md text-caption text-on-surface-variant">
          {{ tr('Scenarios appear once the crop catalogue and telemetry are available.', 'Les scénarios apparaissent dès que le catalogue et la télémétrie sont disponibles.') }}
        </p>
      </div>

      <!-- Quick actions -->
      <div>
        <h3 class="font-headline-sm text-headline-sm text-on-surface mb-3">{{ tr('Key decisions', 'Arbitrages majeurs') }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppCard variant="default" :interactive="true" @click="navigateTo('/scenarios')">
            <div class="flex items-start justify-between mb-3">
              <div class="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
                <span class="material-symbols-outlined text-2xl">autorenew</span>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_forward</span>
            </div>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('nav.scenarios') }}</h4>
            <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-1">
              {{ tr('Chain three seasons and see the nitrogen and water impact.', 'Enchaînez trois saisons et visualisez l’impact azote et eau.') }}
            </p>
          </AppCard>

          <AppCard variant="recommended" :interactive="true" @click="navigateTo('/decision')">
            <div class="flex items-start justify-between mb-3">
              <div class="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shadow-xs">
                <span class="material-symbols-outlined text-2xl">balance</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-md text-caption uppercase font-bold">
                {{ farmStore.scenarios.length }} {{ tr('scenarios', 'scénarios') }}
              </span>
            </div>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('nav.decision') }}</h4>
            <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-1">
              {{ tr('Weight water, FCFA and soil, then read the five-axis radar.', 'Pondérez eau, FCFA et sol, puis lisez le radar à cinq axes.') }}
            </p>
          </AppCard>

          <AppCard variant="default" :interactive="true" @click="navigateTo('/cultures')">
            <div class="flex items-start justify-between mb-3">
              <div class="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shadow-xs">
                <span class="material-symbols-outlined text-2xl">psychiatry</span>
              </div>
              <span class="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_forward</span>
            </div>
            <h4 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('nav.crops') }}</h4>
            <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant mt-1">
              {{ tr(`${farmStore.crops.length} reference varieties with water needs and market prices.`, `${farmStore.crops.length} variétés de référence avec besoins en eau et prix du marché.`) }}
            </p>
          </AppCard>
        </div>
      </div>

      <!-- Data provenance -->
      <div v-if="climate" class="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 border border-outline-variant/30 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Where these numbers come from', 'D’où viennent ces chiffres') }}</h3>
          <RouterLink to="/sources" class="font-body-bold text-caption text-primary hover:underline">
            {{ appStore.t('nav.sources') }}
          </RouterLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-caption">
          <div class="bg-surface-container-low p-3.5 rounded-xl">
            <p class="font-body-bold text-label-lg text-on-surface">{{ climate.provenance.provider }}</p>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5">
              {{ climate.provenance.parameters.join(', ') }}
            </p>
          </div>
          <div class="bg-surface-container-low p-3.5 rounded-xl">
            <p class="font-body-bold text-label-lg text-on-surface">{{ tr('Observation window', 'Fenêtre d’observation') }}</p>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5">
              {{ climate.observed.start }} → {{ climate.observed.end }} ({{ climate.observed.days }} {{ tr('days', 'jours') }})
            </p>
          </div>
          <div class="bg-surface-container-low p-3.5 rounded-xl">
            <p class="font-body-bold text-label-lg text-on-surface">{{ tr('Resolution', 'Résolution') }}</p>
            <p class="font-caption text-caption text-on-surface-variant mt-0.5">{{ climate.provenance.resolution }}</p>
          </div>
        </div>
      </div>
    </template>

    <p class="font-caption text-caption text-center text-on-surface-variant pt-2">
      {{ appStore.t('app.disclaimer') }} {{ tr('NASA POWER observations × IRAD reference models.', 'Observations NASA POWER × modèles de référence IRAD.') }}
    </p>
  </div>
</template>
