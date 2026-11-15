<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore, REGIONS, type RegionLabel } from '@/stores/appStore';
import { useFarmStore } from '@/stores/farmStore';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const auth = useAuthStore();
const appStore = useAppStore();
const farmStore = useFarmStore();
const tr = appStore.tr;

const step = ref(1);
const error = ref<string | null>(null);

const initialRegion = REGIONS.find((r) => r.label === appStore.region) || REGIONS[0];

const form = ref({
  name: '',
  surfaceHa: 1,
  locality: '',
  region: appStore.region as RegionLabel,
  lat: initialRegion.lat,
  lng: initialRegion.lng,
  soilType: 'Ferrallitic clay-loam',
  soilPh: 6,
  slopePercent: 3,
  availableWaterCapacityMm: 120,
  cropName: '',
  variety: '',
  harvestDate: '',
  yieldTonnesHa: 0,
  residualNitrogenKgHa: 0,
});

const soilTypes = computed(() => [
  { value: 'Ferrallitic clay-loam', label: tr('Ferrallitic clay-loam', 'Argilo-limoneux ferrallitique') },
  { value: 'Sandy loam', label: tr('Sandy loam', 'Limon sableux') },
  { value: 'Clay', label: tr('Clay', 'Argileux') },
  { value: 'Volcanic loam', label: tr('Volcanic loam', 'Limon volcanique') },
  { value: 'Sandy', label: tr('Sandy', 'Sableux') },
]);

const onRegionChange = () => {
  const region = REGIONS.find((r) => r.label === form.value.region);
  if (region) {
    form.value.lat = region.lat;
    form.value.lng = region.lng;
  }
};

const next = () => {
  error.value = null;
  if (step.value === 1) {
    if (form.value.name.trim().length < 3) {
      error.value = tr('Give the plot a name of at least 3 characters.', 'Donnez un nom d’au moins 3 caractères à la parcelle.');
      return;
    }
    if (!form.value.locality.trim()) {
      error.value = tr('Enter the locality of the plot.', 'Indiquez la localité de la parcelle.');
      return;
    }
    if (!(form.value.surfaceHa > 0)) {
      error.value = tr('Surface must be greater than 0 ha.', 'La superficie doit être supérieure à 0 ha.');
      return;
    }
  }
  step.value = Math.min(3, step.value + 1);
};

const back = () => {
  if (step.value === 1) {
    router.push('/register');
    return;
  }
  step.value -= 1;
};

const finish = async () => {
  error.value = null;
  try {
    await farmStore.createPlot({
      name: form.value.name.trim(),
      surfaceHa: Number(form.value.surfaceHa),
      soilType: form.value.soilType,
      soilPh: Number(form.value.soilPh),
      slopePercent: Number(form.value.slopePercent),
      availableWaterCapacityMm: Number(form.value.availableWaterCapacityMm),
      coordinates: {
        lat: Number(form.value.lat),
        lng: Number(form.value.lng),
        locality: form.value.locality.trim(),
        region: form.value.region,
      },
      previousCrop: form.value.cropName.trim()
        ? {
            cropName: form.value.cropName.trim(),
            variety: form.value.variety.trim(),
            harvestDate: form.value.harvestDate,
            yieldTonnesHa: Number(form.value.yieldTonnesHa),
            residualNitrogenKgHa: Number(form.value.residualNitrogenKgHa),
          }
        : undefined,
    });
    appStore.setRegion(form.value.region);
    await farmStore.loadAll();
    router.push('/dashboard');
  } catch (e: any) {
    error.value = e?.message || tr('Could not save the plot.', 'Impossible d’enregistrer la parcelle.');
  }
};

const skip = () => router.push('/dashboard');
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col">
    <header class="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-outline-variant/20">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary text-[26px]">agriculture</span>
        <div>
          <p class="font-body-bold text-label-lg text-on-surface leading-none">AgroPredict</p>
          <p class="font-caption text-[11px] text-on-surface-variant">
            {{ tr('Step', 'Étape') }} {{ step }} / 3
          </p>
        </div>
      </div>
      <button
        type="button"
        class="font-caption text-caption text-on-surface-variant hover:text-primary cursor-pointer"
        @click="skip"
      >
        {{ tr('Skip for now', 'Passer pour l’instant') }}
      </button>
    </header>

    <main class="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
      <div class="w-full max-w-xl space-y-6">
        <div class="space-y-1">
          <h1 class="font-headline-lg text-headline-lg text-on-surface">
            {{ tr(`Welcome, ${auth.firstName || 'farmer'}`, `Bienvenue, ${auth.firstName || 'agriculteur'}`) }}
          </h1>
          <p class="font-body-md text-body-md text-on-surface-variant">
            {{
              tr(
                'Register your first plot so AgroPredict can pull the right NASA POWER coordinates and build rotations.',
                'Enregistrez votre première parcelle pour qu’AgroPredict récupère les bonnes coordonnées NASA POWER et construise vos rotations.',
              )
            }}
          </p>
        </div>

        <!-- Progress -->
        <div class="flex items-center gap-2">
          <div
            v-for="s in 3"
            :key="s"
            class="h-1.5 flex-1 rounded-full"
            :class="s <= step ? 'bg-primary' : 'bg-surface-container-highest'"
          ></div>
        </div>

        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-5 sm:p-6 space-y-4">
          <!-- Step 1: plot -->
          <template v-if="step === 1">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">
              {{ tr('1. Plot and location', '1. Parcelle et localisation') }}
            </h2>

            <label class="block space-y-1">
              <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Plot name', 'Nom de la parcelle') }}</span>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                :placeholder="tr('Obala North – Plot 01', 'Obala Nord – Parcelle 01')"
              />
            </label>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Locality', 'Localité') }}</span>
                <input
                  v-model="form.locality"
                  type="text"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Obala"
                />
              </label>
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Region', 'Région') }}</span>
                <select
                  v-model="form.region"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                  @change="onRegionChange"
                >
                  <option v-for="r in REGIONS" :key="r.label" :value="r.label">{{ appStore.t(r.key) }}</option>
                </select>
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Surface (ha)', 'Superficie (ha)') }}</span>
                <input
                  v-model.number="form.surfaceHa"
                  type="number"
                  min="0.1"
                  step="0.1"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Soil texture', 'Texture du sol') }}</span>
                <select
                  v-model="form.soilType"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option v-for="s in soilTypes" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </label>
            </div>

            <p class="font-caption text-[11px] text-on-surface-variant">
              {{ tr('GPS used for the NASA POWER request:', 'GPS utilisé pour la requête NASA POWER :') }}
              <strong>{{ form.lat.toFixed(4) }}, {{ form.lng.toFixed(4) }}</strong>
            </p>
          </template>

          <!-- Step 2: soil and previous crop -->
          <template v-else-if="step === 2">
            <h2 class="font-headline-sm text-headline-sm text-on-surface">
              {{ tr('2. Soil and last harvest', '2. Sol et dernière récolte') }}
            </h2>

            <div class="grid grid-cols-3 gap-3">
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Soil pH', 'pH du sol') }}</span>
                <input
                  v-model.number="form.soilPh"
                  type="number"
                  min="3"
                  max="9"
                  step="0.1"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Slope %', 'Pente %') }}</span>
                <input
                  v-model.number="form.slopePercent"
                  type="number"
                  min="0"
                  step="0.1"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              <label class="block space-y-1">
                <span class="font-label-md text-caption text-on-surface-variant">{{ tr('AWC (mm)', 'RU (mm)') }}</span>
                <input
                  v-model.number="form.availableWaterCapacityMm"
                  type="number"
                  min="10"
                  step="5"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            </div>

            <div class="pt-2 border-t border-outline-variant/20 space-y-3">
              <p class="font-label-md text-caption text-on-surface-variant">
                {{ tr('Previous crop (optional)', 'Culture précédente (optionnel)') }}
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  v-model="form.cropName"
                  type="text"
                  :placeholder="tr('Crop name, e.g. White maize', 'Nom de la culture, ex. Maïs blanc')"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  v-model="form.variety"
                  type="text"
                  :placeholder="tr('Variety, e.g. CMS 8704', 'Variété, ex. CMS 8704')"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  v-model="form.harvestDate"
                  type="date"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <input
                  v-model.number="form.yieldTonnesHa"
                  type="number"
                  min="0"
                  step="0.1"
                  :placeholder="tr('Yield (t/ha)', 'Rendement (t/ha)')"
                  class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>
          </template>

          <!-- Step 3: review -->
          <template v-else>
            <h2 class="font-headline-sm text-headline-sm text-on-surface">
              {{ tr('3. Review', '3. Récapitulatif') }}
            </h2>
            <dl class="space-y-2 font-body-md text-caption">
              <div class="flex justify-between gap-4 py-1 border-b border-outline-variant/20">
                <dt class="text-on-surface-variant">{{ tr('Plot', 'Parcelle') }}</dt>
                <dd class="font-body-bold text-on-surface text-right">{{ form.name }}</dd>
              </div>
              <div class="flex justify-between gap-4 py-1 border-b border-outline-variant/20">
                <dt class="text-on-surface-variant">{{ tr('Locality', 'Localité') }}</dt>
                <dd class="font-body-bold text-on-surface text-right">
                  {{ form.locality }} · {{ appStore.t(REGIONS.find((r) => r.label === form.region)?.key || '') }}
                </dd>
              </div>
              <div class="flex justify-between gap-4 py-1 border-b border-outline-variant/20">
                <dt class="text-on-surface-variant">{{ tr('Surface', 'Superficie') }}</dt>
                <dd class="font-body-bold text-on-surface text-right">{{ form.surfaceHa }} ha</dd>
              </div>
              <div class="flex justify-between gap-4 py-1 border-b border-outline-variant/20">
                <dt class="text-on-surface-variant">{{ tr('GPS', 'GPS') }}</dt>
                <dd class="font-body-bold text-on-surface text-right">
                  {{ Number(form.lat).toFixed(4) }}, {{ Number(form.lng).toFixed(4) }}
                </dd>
              </div>
              <div class="flex justify-between gap-4 py-1">
                <dt class="text-on-surface-variant">{{ tr('Soil', 'Sol') }}</dt>
                <dd class="font-body-bold text-on-surface text-right">
                  {{ form.soilType }} · pH {{ form.soilPh }}
                </dd>
              </div>
            </dl>
            <p class="font-caption text-[11px] text-on-surface-variant">
              {{
                tr(
                  'On save, AgroPredict requests live NASA POWER telemetry for these coordinates.',
                  'À l’enregistrement, AgroPredict demande la télémétrie NASA POWER en direct pour ces coordonnées.',
                )
              }}
            </p>
          </template>

          <p
            v-if="error"
            class="text-error font-caption text-caption bg-error-container/30 border border-error/30 rounded-xl px-3 py-2"
          >
            {{ error }}
          </p>

          <div class="flex flex-col sm:flex-row gap-3 pt-1">
            <AppButton variant="secondary" icon="arrow_back" class="flex-1" @click="back">
              {{ tr('Back', 'Retour') }}
            </AppButton>
            <AppButton
              v-if="step < 3"
              variant="primary"
              icon="arrow_forward"
              class="flex-1"
              @click="next"
            >
              {{ tr('Continue', 'Continuer') }}
            </AppButton>
            <AppButton
              v-else
              variant="primary"
              icon="check"
              class="flex-1"
              :disabled="farmStore.saving"
              @click="finish"
            >
              {{ farmStore.saving ? tr('Saving…', 'Enregistrement…') : tr('Save and open dashboard', 'Enregistrer et ouvrir le tableau de bord') }}
            </AppButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
