<script setup lang="ts">
import { useFarmStore } from '@/stores/farmStore';
import AppBadge from '@/components/common/AppBadge.vue';

const farmStore = useFarmStore();

const constellations = [
  {
    name: 'NASA GPM IMERG',
    fullname: 'Integrated Multi-satellitE Retrievals for GPM',
    resolution: '0.1° (~10 km) recalé 10m SRTM',
    frequency: 'Toutes les 30 minutes',
    metric: 'Pluie cumulée et risque de stress hydrique',
    history: '20 ans (2004–2024)',
    icon: 'rainy',
    color: 'text-tertiary',
  },
  {
    name: 'NASA SMAP',
    fullname: 'Soil Moisture Active Passive Radar',
    resolution: 'Radar micro-ondes bande L (3 km)',
    frequency: 'Relecture tous les 2 à 3 jours',
    metric: 'Humidité volumétrique de la terre (0–5 cm et RU)',
    history: 'Depuis 2015',
    icon: 'water_loss',
    color: 'text-primary',
  },
  {
    name: 'NASA POWER',
    fullname: 'Prediction of Worldwide Energy Resources',
    resolution: '0.5° × 0.5°',
    frequency: 'Mise à jour journalière synchrone',
    metric: 'Température à 2m, ensoleillement, évapotranspiration ET₀',
    history: '40 ans de données météo',
    icon: 'device_thermostat',
    color: 'text-secondary',
  },
  {
    name: 'MODIS & Sentinel-2',
    fullname: 'Moderate Resolution Imaging Spectroradiometer',
    resolution: '250m à 10m optique multispectrale',
    frequency: 'Passe tous les 5 à 16 jours',
    metric: 'Indice NDVI de vigueur foliaire et biomasse',
    history: 'Continu',
    icon: 'psychiatry',
    color: 'text-primary',
  },
];

const faqs = [
  {
    q: 'Comment sont calculées les marges nettes en FCFA ?',
    a: 'Les cours de référence sont actualisés chaque semaine à partir des mercuriales du MINADER et des relevés des marchés de gros du 8ème à Yaoundé et d’Obala. Les coûts des semences homologuées IRAD et de la main-d’œuvre locale sont déduits.',
  },
  {
    q: 'Les résolutions satellites sont-elles adaptées aux parcelles de moins de 1 hectare ?',
    a: 'Oui. Le downscaling topographique s’appuie sur le modèle d’élévation SRTM à 10 mètres de résolution, ce qui permet de corriger le signal pluviométrique brut selon la pente et l’exposition de la parcelle paysanne.',
  },
  {
    q: 'Que se passe-t-il en cas de coupure de réseau internet en brousse ?',
    a: 'AgroPredict fonctionne en mode PWA complètement hors-ligne grâce à son cache local. Les données satellites et les matrices de décision du bassin Lékié restent disponibles même en zone blanche 2G/3G.',
  },
];
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Header with Provenance Badges -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div class="max-w-3xl space-y-1.5">
        <div class="flex items-center gap-2 flex-wrap">
          <AppBadge variant="satellite" icon="satellite_alt">
            NASA Applied Sciences Program
          </AppBadge>
          <AppBadge variant="primary" icon="verified">
            Calibré IRAD Nkolbisson
          </AppBadge>
          <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption">
            v3.4.2 • 2025
          </span>
        </div>
        <h1 class="font-display-lg text-headline-lg lg:text-display-lg text-on-surface tracking-tight">
          Données &amp; Sources Satellitaires
        </h1>
        <p class="font-body-md sm:font-body-lg text-body-md sm:text-body-lg text-on-surface-variant leading-relaxed">
          Transparence sur les constellations d'observation spatiale de la NASA, les résolutions et les modèles agronomiques étalonnés au Cameroun.
        </p>
      </div>

      <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex items-center gap-3 shrink-0">
        <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
          <span class="material-symbols-outlined text-[24px]">insights</span>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span class="font-label-md text-label-md text-on-surface font-semibold">Flux NASA Synchrone</span>
          </div>
          <p class="font-caption text-caption text-on-surface-variant mt-0.5">Dernière passe : il y a 14 min</p>
        </div>
      </div>
    </div>

    <!-- Overview Statement + Station Picture Grid (12 cols) -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div class="md:col-span-8 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4">
        <div class="space-y-2 max-w-xl">
          <div class="flex items-center gap-2 text-secondary font-label-md text-label-md uppercase tracking-wider">
            <span class="material-symbols-outlined text-[18px]">biotech</span>
            Méthodologie Agrométéorologique Hybride
          </div>
          <h2 class="font-headline-sm text-headline-sm text-on-surface leading-snug">
            De l'orbite spatiale aux sillons d'Obala : relier la télédétection aux réalités locales.
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Les modèles AgroPredict ne reposent pas sur des extrapolations théoriques. Chaque flux satellitaire est corrigé statistiquement par les relevés des 14 stations automatiques de l'Institut de Recherche Agricole pour le Développement (IRAD) réparties entre le bassin du Mfoundi, la Lékié et l'Adamaoua.
          </p>
        </div>

        <div class="pt-4 border-t border-outline-variant/20 flex flex-wrap items-center gap-6">
          <div>
            <div class="font-display-lg text-headline-lg text-primary font-bold">20 ans</div>
            <div class="font-caption text-caption text-on-surface-variant">Historique continu (2004–2024)</div>
          </div>
          <div>
            <div class="font-display-lg text-headline-lg text-secondary font-bold">0.1° → 10m</div>
            <div class="font-caption text-caption text-on-surface-variant">Downscaling relief SRTM</div>
          </div>
          <div>
            <div class="font-display-lg text-headline-lg text-tertiary font-bold">98.2%</div>
            <div class="font-caption text-caption text-on-surface-variant">Corrélation pluviomètres IRAD</div>
          </div>
        </div>
      </div>

      <!-- Station Image Card (4 cols) -->
      <div class="md:col-span-4 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/30 shadow-sm flex flex-col">
        <div class="relative h-44 w-full">
          <img
            class="w-full h-full object-cover"
            alt="Station IRAD Nkolbisson"
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-transparent to-transparent flex items-end p-4">
            <div class="text-inverse-on-surface">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-container-lowest/30 backdrop-blur-sm">
                Site de Calibration
              </span>
              <p class="font-body-bold text-label-lg mt-0.5">Station IRAD • Nkolbisson</p>
            </div>
          </div>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between space-y-2">
          <p class="font-caption text-caption text-on-surface-variant">
            Pluviomètres à augets basculeurs et sondes TDR capacitives enfouies à 10 cm, 20 cm et 40 cm pour la calibration fine des modèles.
          </p>
          <div class="flex items-center justify-between pt-1 text-primary font-body-bold text-caption">
            <span>Lat: 3°52' N • Lon: 11°27' E</span>
            <span class="material-symbols-outlined text-[16px]">location_on</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4 Core Constellations Grid -->
    <div>
      <h3 class="font-headline-sm text-headline-sm text-on-surface mb-3">
        Constellations Satellitaires Mobilisées
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="c in constellations"
          :key="c.name"
          class="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-xs flex flex-col justify-between space-y-3"
        >
          <div class="space-y-2">
            <div class="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center" :class="c.color">
              <span class="material-symbols-outlined text-[22px]">{{ c.icon }}</span>
            </div>
            <div>
              <h4 class="font-body-bold text-label-lg text-on-surface">{{ c.name }}</h4>
              <p class="font-caption text-[11px] text-on-surface-variant leading-tight">{{ c.fullname }}</p>
            </div>
            <p class="font-caption text-caption text-on-surface pt-1">
              {{ c.metric }}
            </p>
          </div>

          <div class="pt-2 border-t border-outline-variant/20 text-[11px] text-on-surface-variant space-y-1">
            <div class="flex justify-between">
              <span>Résolution :</span>
              <strong class="text-on-surface">{{ c.resolution }}</strong>
            </div>
            <div class="flex justify-between">
              <span>Fréquence :</span>
              <strong class="text-on-surface">{{ c.frequency }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Accordion / Cards -->
    <div class="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
      <h3 class="font-headline-sm text-headline-sm text-on-surface">Foire Aux Questions Méthodologiques</h3>
      <div class="space-y-3">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="p-4 rounded-xl bg-surface-container-low space-y-1"
        >
          <h4 class="font-body-bold text-label-lg text-primary flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">help</span>
            {{ faq.q }}
          </h4>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant pl-6">
            {{ faq.a }}
          </p>
        </div>
      </div>
    </div>

    <p class="font-caption text-caption text-center text-on-surface-variant">
      Estimation indicative, pas une prévision de rendement.
    </p>
  </div>
</template>
