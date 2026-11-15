<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore, REGIONS, type RegionLabel } from '@/stores/appStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import FarmCartography from '@/components/farm/FarmCartography.vue';

const router = useRouter();
const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const plot = computed(() => farmStore.activePlot);
const saveSuccess = ref(false);
const saveError = ref<string | null>(null);

const form = reactive({
  name: '',
  surfaceHa: 0,
  soilType: '',
  soilPh: 6,
  slopePercent: 3,
  availableWaterCapacityMm: 120,
  locality: '',
  region: 'Lékié' as RegionLabel,
  lat: 0,
  lng: 0,
  cropName: '',
  variety: '',
  harvestDate: '',
  yieldTonnesHa: 0,
  residualNitrogenKgHa: 0,
});

const syncFromPlot = () => {
  const p = plot.value;
  if (!p) return;
  form.name = p.name;
  form.surfaceHa = p.surfaceHa;
  form.soilType = p.soilType;
  form.soilPh = p.soilPh;
  form.slopePercent = p.slopePercent;
  form.availableWaterCapacityMm = p.availableWaterCapacityMm;
  form.locality = p.coordinates.locality;
  form.region = (REGIONS.some((r) => r.label === p.coordinates.region) ? p.coordinates.region : 'Lékié') as RegionLabel;
  form.lat = p.coordinates.lat;
  form.lng = p.coordinates.lng;
  form.cropName = p.previousCrop.cropName;
  form.variety = p.previousCrop.variety;
  form.harvestDate = p.previousCrop.harvestDate;
  form.yieldTonnesHa = p.previousCrop.yieldTonnesHa;
  form.residualNitrogenKgHa = p.previousCrop.residualNitrogenKgHa;
};

watch(() => farmStore.activePlotId, syncFromPlot, { immediate: true });
watch(plot, syncFromPlot);

const soilTypes = computed(() => [
  { value: 'Ferrallitic clay-loam', label: tr('Ferrallitic clay-loam', 'Argilo-limoneux ferrallitique') },
  { value: 'Deep red laterite', label: tr('Deep red laterite', 'Latéritique rouge profond') },
  { value: 'Hydromorphic sandy-clay', label: tr('Hydromorphic sandy-clay', 'Sablo-argileux hydromorphe') },
  { value: 'Fertile volcanic', label: tr('Fertile volcanic', 'Volcanique fertile') },
  { value: 'Sandy loam', label: tr('Sandy loam', 'Limon sableux') },
]);

const onRegionChange = () => {
  const region = REGIONS.find((r) => r.label === form.region);
  if (region) {
    form.lat = region.lat;
    form.lng = region.lng;
  }
};

const save = async () => {
  if (!plot.value) return;
  saveError.value = null;
  try {
    await farmStore.updatePlot(plot.value.id, {
      name: form.name,
      surfaceHa: Number(form.surfaceHa),
      soilType: form.soilType,
      soilPh: Number(form.soilPh),
      slopePercent: Number(form.slopePercent),
      availableWaterCapacityMm: Number(form.availableWaterCapacityMm),
      coordinates: {
        lat: Number(form.lat),
        lng: Number(form.lng),
        locality: form.locality,
        region: form.region,
      },
      previousCrop: {
        cropName: form.cropName,
        variety: form.variety,
        harvestDate: form.harvestDate,
        yieldTonnesHa: Number(form.yieldTonnesHa),
        residualNitrogenKgHa: Number(form.residualNitrogenKgHa),
      },
    });
    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 2500);
  } catch (e: any) {
    saveError.value = e?.message || tr('Could not save the plot.', 'Impossible d’enregistrer la parcelle.');
  }
};

const removePlot = async () => {
  if (!plot.value) return;
  if (!confirm(tr(`Delete “${plot.value.name}” and its link to NASA data?`, `Supprimer « ${plot.value.name} » et son lien aux données NASA ?`))) return;
  await farmStore.deletePlot(plot.value.id);
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md tracking-wider uppercase mb-1">
          <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span>{{ tr('Farm register', 'Registre de la ferme') }}</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">{{ appStore.t('farmPage.heading') }}</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1 max-w-2xl">
          {{
            tr(
              'Each plot stores its own coordinates, soil profile and past harvest. NASA POWER telemetry follows the plot you select.',
              'Chaque parcelle conserve ses coordonnées, son profil de sol et sa récolte passée. La télémétrie NASA POWER suit la parcelle sélectionnée.',
            )
          }}
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <AppBadge variant="satellite" icon="satellite_alt">{{ farmStore.plots.length }} {{ tr('plots', 'parcelles') }}</AppBadge>
        <AppButton variant="primary" icon="add_location_alt" @click="router.push('/onboarding')">
          {{ tr('Add a plot', 'Ajouter une parcelle') }}
        </AppButton>
      </div>
    </div>

    <div v-if="farmStore.loadingPlots" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center">
      <span class="material-symbols-outlined animate-spin text-[28px] text-primary">progress_activity</span>
      <p class="font-body-md text-caption text-on-surface-variant mt-2">{{ tr('Loading your plots…', 'Chargement de vos parcelles…') }}</p>
    </div>

    <div v-else-if="farmStore.plotsError" class="bg-error-container/30 border border-error/40 rounded-2xl p-5 space-y-2">
      <p class="font-body-bold text-label-lg text-error">{{ farmStore.plotsError }}</p>
      <AppButton variant="secondary" size="sm" icon="refresh" @click="farmStore.loadPlots()">{{ tr('Retry', 'Réessayer') }}</AppButton>
    </div>

    <div v-else-if="!plot" class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-primary text-[36px]">landscape</span>
      <p class="font-body-md text-caption text-on-surface-variant">{{ tr('You have not registered any plot yet.', 'Vous n’avez encore enregistré aucune parcelle.') }}</p>
      <AppButton variant="primary" icon="add" @click="router.push('/onboarding')">{{ tr('Create a plot', 'Créer une parcelle') }}</AppButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Cartography -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/30">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">polyline</span>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('farmPage.delimitation') }}</h3>
              </div>
              <p class="font-caption text-caption text-on-surface-variant">
                {{ plot.coordinates.lat.toFixed(4) }}, {{ plot.coordinates.lng.toFixed(4) }} · {{ plot.coordinates.locality }}
              </p>
            </div>
            <AppBadge variant="primary" icon="check_circle">{{ plot.code }}</AppBadge>
          </div>

          <FarmCartography
            :plot-name="plot.name"
            :plot-code="plot.code"
            :surface-ha="plot.surfaceHa"
            :slope-percent="plot.slopePercent"
            :locality="plot.coordinates.locality"
            :lat="plot.coordinates.lat"
            :lng="plot.coordinates.lng"
          />

          <div class="mt-3 flex flex-wrap items-center justify-between gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl text-caption">
            <span class="text-on-surface-variant">
              {{ appStore.t('farmPage.computedArea') }} :
              <strong class="text-primary font-body-bold">{{ plot.surfaceHa }} ha</strong>
            </span>
            <span class="text-on-surface-variant">
              {{ appStore.t('farmPage.slopeLabel') }} : <strong class="text-tertiary">{{ plot.slopePercent }}%</strong>
            </span>
            <span class="text-on-surface-variant">
              AWC : <strong class="text-secondary">{{ plot.availableWaterCapacityMm }} mm</strong>
            </span>
          </div>
        </div>

        <!-- Plot switcher -->
        <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs space-y-2">
          <h4 class="font-body-bold text-label-lg text-on-surface">{{ tr('Switch active plot', 'Changer de parcelle active') }}</h4>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in farmStore.plots"
              :key="p.id"
              type="button"
              :class="[
                'px-3 py-2 rounded-xl border text-left cursor-pointer transition-colors',
                p.id === plot.id ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container',
              ]"
              @click="farmStore.setActivePlot(p.id)"
            >
              <span class="block font-body-bold text-caption text-on-surface">{{ p.name }}</span>
              <span class="block font-caption text-[11px] text-on-surface-variant">{{ p.code }} • {{ p.surfaceHa }} ha</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/30 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('farmPage.soilTitle') }}</h3>
          <span class="font-caption text-caption text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full font-semibold">
            {{ tr('Editable', 'Modifiable') }}
          </span>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1">{{ appStore.t('farmPage.plotName') }}</label>
            <input v-model="form.name" type="text" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Surface (ha)', 'Superficie (ha)') }}</label>
              <input v-model.number="form.surfaceHa" type="number" step="0.1" min="0.1" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ appStore.t('farmPage.ph') }}</label>
              <input v-model.number="form.soilPh" type="number" step="0.1" min="3" max="9" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label class="block font-label-md text-label-md text-on-surface mb-1">{{ appStore.t('farmPage.texture') }}</label>
            <select v-model="form.soilType" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
              <option v-for="t in soilTypes" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Locality', 'Localité') }}</label>
              <input v-model="form.locality" type="text" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Region', 'Région') }}</label>
              <select v-model="form.region" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" @change="onRegionChange">
                <option v-for="r in REGIONS" :key="r.label" :value="r.label">{{ appStore.t(r.key) }}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Latitude', 'Latitude') }}</label>
              <input v-model.number="form.lat" type="number" step="0.0001" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Longitude', 'Longitude') }}</label>
              <input v-model.number="form.lng" type="number" step="0.0001" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div class="pt-2 border-t border-outline-variant/20 space-y-3">
            <p class="font-label-md text-caption text-on-surface-variant">{{ tr('Previous crop', 'Culture précédente') }}</p>
            <div class="grid grid-cols-2 gap-3">
              <input v-model="form.cropName" type="text" :placeholder="tr('Crop', 'Culture')" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input v-model="form.variety" type="text" :placeholder="tr('Variety', 'Variété')" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input v-model="form.harvestDate" type="date" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input v-model.number="form.yieldTonnesHa" type="number" step="0.1" min="0" :placeholder="tr('Yield t/ha', 'Rendement t/ha')" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>

        <p v-if="saveError" class="text-error font-caption text-caption bg-error-container/30 border border-error/30 rounded-xl px-3 py-2">{{ saveError }}</p>

        <div class="pt-2 space-y-2">
          <AppButton variant="primary" size="lg" :full-width="true" icon="save" :disabled="farmStore.saving" @click="save">
            {{ farmStore.saving ? tr('Saving…', 'Enregistrement…') : appStore.t('farmPage.savePlot') }}
          </AppButton>
          <p v-if="saveSuccess" class="font-label-md text-caption text-center text-primary">{{ appStore.t('farmPage.savedOk') }}</p>
          <button type="button" class="w-full text-center font-caption text-caption text-error hover:underline cursor-pointer pt-1" @click="removePlot">
            {{ tr('Delete this plot', 'Supprimer cette parcelle') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
