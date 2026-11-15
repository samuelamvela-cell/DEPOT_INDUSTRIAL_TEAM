<script setup lang="ts">
import { computed } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const t = computed(() => farmStore.telemetry);
const plot = computed(() => farmStore.activePlot);

const fetchedLabel = computed(() => {
  const at = t.value?.provenance.fetchedAt;
  if (!at) return tr('not fetched yet', 'pas encore récupéré');
  return new Date(at).toLocaleString(appStore.language === 'fr' ? 'fr-FR' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
});

const provenanceRows = computed(() => {
  const p = t.value?.provenance;
  if (!p) return [];
  return [
    { label: tr('Provider', 'Fournisseur'), value: p.provider },
    { label: tr('API version', 'Version API'), value: p.apiVersion },
    { label: tr('Parameters', 'Paramètres'), value: p.parameters.join(', ') },
    { label: tr('Resolution', 'Résolution'), value: p.resolution },
    { label: tr('Time standard', 'Référentiel temporel'), value: p.timeStandard },
    { label: tr('Fetched at', 'Récupéré le'), value: fetchedLabel.value },
  ];
});

const faqs = computed(() => [
  {
    q: tr('Where do the rainfall figures come from?', 'D’où viennent les chiffres de pluie ?'),
    a: tr(
      '7-day and 30-day accumulations come from NASA POWER PRECTOTCORR for the plot coordinates. The 30-day anomaly is the deviation from the 25-year normal (2001–2025) computed by NASA POWER climatology for the same calendar window.',
      'Les cumuls sur 7 et 30 jours proviennent de NASA POWER PRECTOTCORR pour les coordonnées de la parcelle. L’anomalie 30 jours est l’écart à la normale 25 ans (2001–2025) calculée par la climatologie NASA POWER sur la même fenêtre calendaire.',
    ),
  },
  {
    q: tr('How is the seeding window computed?', 'Comment la fenêtre de semis est-elle calculée ?'),
    a: tr(
      'It is the first 14-day window whose normal rainfall exceeds half the monthly peak, taken from the POWER climatology for the plot. It is a climatological window, not a weather forecast.',
      'C’est la première fenêtre de 14 jours dont la pluie normale dépasse la moitié du pic mensuel, issue de la climatologie POWER de la parcelle. C’est une fenêtre climatologique, pas une prévision météo.',
    ),
  },
  {
    q: tr('What feeds the crop catalogue?', 'Qu’est-ce qui alimente le catalogue des cultures ?'),
    a: tr(
      'Eight reference varieties served by the AgroPredict API, with cycle length, seasonal water requirement, nitrogen effect, potential yield and indicative wholesale price derived from IRAD and FAO reference sheets.',
      'Huit variétés de référence servies par l’API AgroPredict, avec durée de cycle, besoin en eau saisonnier, effet azoté, rendement potentiel et prix de gros indicatif issus des fiches IRAD et FAO.',
    ),
  },
  {
    q: tr('What happens with no internet in the field?', 'Que se passe-t-il sans internet sur le terrain ?'),
    a: tr(
      'The plot list, crop catalogue and the last telemetry response are kept in the browser cache, so the already computed rotations stay readable offline. New telemetry requests need a connection.',
      'La liste des parcelles, le catalogue et la dernière réponse de télémétrie restent en cache navigateur : les rotations déjà calculées restent lisibles hors-ligne. Une nouvelle requête de télémétrie nécessite une connexion.',
    ),
  },
]);
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="max-w-3xl space-y-1.5">
        <div class="flex items-center gap-2 flex-wrap">
          <AppBadge variant="satellite" icon="satellite_alt">NASA POWER</AppBadge>
          <AppBadge variant="primary" icon="verified">{{ tr('IRAD / FAO reference catalogue', 'Catalogue de référence IRAD / FAO') }}</AppBadge>
        </div>
        <h1 class="font-display-lg text-headline-lg lg:text-display-lg text-on-surface tracking-tight">
          {{ appStore.t('nav.sources') }}
        </h1>
        <p class="font-body-md sm:font-body-lg text-body-md sm:text-body-lg text-on-surface-variant leading-relaxed">
          {{
            tr(
              'Every number in the app traces back to a live API call. Here is exactly what was requested, where it came from and when.',
              'Chaque chiffre de l’application provient d’un appel API réel. Voici précisément ce qui a été demandé, d’où cela vient et quand.',
            )
          }}
        </p>
      </div>

      <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex items-center gap-3 shrink-0">
        <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-[24px]">insights</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span :class="['w-2 h-2 rounded-full', t ? 'bg-primary animate-pulse' : 'bg-outline']"></span>
            <span class="font-label-md text-label-md text-on-surface font-semibold">
              {{ t ? tr('Live NASA response', 'Réponse NASA en direct') : tr('No response yet', 'Aucune réponse') }}
            </span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant mt-0.5">{{ fetchedLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Live values -->
    <div v-if="t" class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="md:col-span-8 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
        <div class="space-y-2 max-w-xl">
          <div class="flex items-center gap-2 text-secondary font-label-md text-label-md uppercase tracking-wider">
            <span class="material-symbols-outlined text-[18px]">biotech</span>
            {{ tr('Request provenance', 'Provenance de la requête') }}
          </div>
          <h2 class="font-headline-sm text-headline-sm text-on-surface leading-snug">
            {{ plot ? plot.name : tr('No plot selected', 'Aucune parcelle sélectionnée') }}
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            {{ t.location.lat.toFixed(4) }}, {{ t.location.lng.toFixed(4) }}
            <span v-if="t.location.elevationM !== null"> · {{ t.location.elevationM }} m</span>
          </p>
        </div>

        <dl class="divide-y divide-outline-variant/20 text-caption">
          <div v-for="row in provenanceRows" :key="row.label" class="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2">
            <dt class="text-on-surface-variant sm:w-44 shrink-0">{{ row.label }}</dt>
            <dd class="text-on-surface font-body-bold break-words">{{ row.value }}</dd>
          </div>
        </dl>

        <a :href="t.provenance.url" target="_blank" rel="noopener" class="inline-flex items-center gap-1 text-primary font-label-md text-caption hover:underline">
          <span class="material-symbols-outlined text-[16px]">open_in_new</span>
          {{ tr('Open the NASA POWER request', 'Ouvrir la requête NASA POWER') }}
        </a>
      </div>

      <div class="md:col-span-4 space-y-3">
        <div
          v-for="s in farmStore.satelliteSources"
          :key="s.id"
          class="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-xs space-y-1.5"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-body-bold text-caption text-on-surface">{{ s.name }}</p>
            <AppBadge :variant="s.status === 'valid' ? 'primary' : 'secondary'">{{ s.status }}</AppBadge>
          </div>
          <p class="font-caption text-[11px] text-on-surface-variant leading-tight">{{ s.fullName }}</p>
          <p class="font-headline-sm text-headline-sm text-primary font-bold">
            {{ s.currentValue }} <span class="text-body-md font-normal text-on-surface-variant">{{ s.unit }}</span>
          </p>
          <p class="font-caption text-[11px] text-on-surface-variant">{{ s.metric }} · {{ s.lastPassAgo }}</p>
        </div>
      </div>
    </div>

    <div v-else class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 text-center space-y-3">
      <span class="material-symbols-outlined text-primary text-[32px]">cloud_off</span>
      <p class="font-body-md text-caption text-on-surface-variant">
        {{ tr('No telemetry loaded yet for this plot.', 'Aucune télémétrie chargée pour cette parcelle.') }}
      </p>
      <AppButton variant="primary" size="sm" icon="refresh" @click="farmStore.loadTelemetry(true)">{{ tr('Fetch now', 'Récupérer') }}</AppButton>
    </div>

    <!-- Methodology -->
    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-3">
      <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('How a recommendation is built', 'Comment une recommandation est construite') }}</h3>
      <ol class="grid grid-cols-1 md:grid-cols-3 gap-4 text-caption">
        <li class="p-4 rounded-xl bg-surface-container-low space-y-1">
          <span class="font-body-bold text-primary">1.</span>
          <p class="font-body-bold text-label-md text-on-surface">{{ tr('Pull the weather', 'Récupérer la météo') }}</p>
          <p class="text-on-surface-variant">
            {{ tr('Rain, temperature, ET₀ and soil wetness for the plot coordinates, plus 25 years of monthly normals.', 'Pluie, température, ET₀ et humidité du sol aux coordonnées de la parcelle, plus 25 ans de normales mensuelles.') }}
          </p>
        </li>
        <li class="p-4 rounded-xl bg-surface-container-low space-y-1">
          <span class="font-body-bold text-primary">2.</span>
          <p class="font-body-bold text-label-md text-on-surface">{{ tr('Score the rotations', 'Noter les rotations') }}</p>
          <p class="text-on-surface-variant">
            {{ tr('Each rotation is scored on water security, climate match, soil fertility, diversification and margin.', 'Chaque rotation est notée sur la sécurité hydrique, l’adéquation climatique, la fertilité, la diversification et la marge.') }}
          </p>
        </li>
        <li class="p-4 rounded-xl bg-surface-container-low space-y-1">
          <span class="font-body-bold text-primary">3.</span>
          <p class="font-body-bold text-label-md text-on-surface">{{ tr('Compare and decide', 'Comparer et décider') }}</p>
          <p class="text-on-surface-variant">
            {{ tr('Weight what matters to your farm, compare three rotations side by side, then open the detail sheet.', 'Pondérez ce qui compte pour votre ferme, comparez trois rotations, puis ouvrez la fiche détaillée.') }}
          </p>
        </li>
      </ol>
    </div>

    <!-- FAQ -->
    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
      <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Frequently asked questions', 'Questions fréquentes') }}</h3>
      <div class="space-y-3">
        <div v-for="(faq, i) in faqs" :key="i" class="p-4 rounded-xl bg-surface-container-low space-y-1">
          <h4 class="font-body-bold text-label-lg text-primary flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">help</span>
            {{ faq.q }}
          </h4>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant pl-6">{{ faq.a }}</p>
        </div>
      </div>
    </div>

    <p class="font-caption text-caption text-center text-on-surface-variant">
      {{ tr('Indicative estimation, not a yield forecast.', 'Estimation indicative, pas une prévision de rendement.') }}
    </p>
  </div>
</template>
