<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFarmStore } from '@/stores/farmStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppGauge from '@/components/common/AppGauge.vue';

const route = useRoute();
const router = useRouter();
const farmStore = useFarmStore();

const scenario = computed(() => {
  const paramId = route.params.id as string;
  return farmStore.scenarios.find((s) => s.id === paramId) || farmStore.scenarios[0];
});

const goBack = () => {
  router.push('/decision');
};

const downloadPdf = () => {
  alert("Téléchargement de la fiche agronomique de semis (Format PDF <200 Ko pour WhatsApp & Bluetooth)...");
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Back Navigation & Top Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-primary font-body-bold text-body-md hover:underline cursor-pointer group"
        @click="goBack"
      >
        <span class="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">arrow_back</span>
        <span>Revenir au comparateur de scénarios</span>
      </button>

      <div class="flex items-center gap-2.5 flex-wrap">
        <AppButton variant="secondary" icon="tune" @click="$router.push('/scenarios')">
          Modifier ce scénario
        </AppButton>
        <AppButton variant="primary" icon="file_download" @click="downloadPdf">
          Télécharger la fiche (PDF)
        </AppButton>
      </div>
    </div>

    <!-- Header & Hero Score Card -->
    <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8 flex flex-col lg:flex-row gap-6 lg:items-center justify-between relative overflow-hidden">
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      <div class="space-y-2 max-w-2xl relative z-10">
        <div class="flex flex-wrap items-center gap-2">
          <AppBadge v-if="scenario.isRecommended" variant="secondary" icon="star">
            Scénario Recommandé • Option {{ scenario.tag }}
          </AppBadge>
          <AppBadge variant="satellite" icon="satellite_alt">
            NASA POWER / SMAP Validé
          </AppBadge>
        </div>

        <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
          {{ scenario.name }}
        </h1>
        <p class="font-body-md text-body-md text-on-surface-variant">
          Itinéraire technique agro-climatique approfondi pour la parcelle d'Obala (3.2 ha) — Campagne 2025/2026.
        </p>
      </div>

      <!-- Score Ring Module -->
      <div class="flex items-center gap-4 bg-surface-container-low/70 p-4 rounded-2xl shrink-0 self-start lg:self-auto border border-outline-variant/30 shadow-xs">
        <AppGauge
          :score="scenario.overallScore"
          size="lg"
          label="Résilience Maximale"
          sublabel="Excellente résilience climatique et régénération azotée naturelle."
        />
      </div>
    </div>

    <!-- 3 Season Cards Grid -->
    <div>
      <h2 class="font-headline-md text-headline-md text-on-surface mb-3">
        Décomposition Saisonnière de l'Itinéraire
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          v-for="(phase, idx) in scenario.phases"
          :key="idx"
          class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-md text-caption">
                {{ phase.seasonName.split(' ')[0] }} {{ phase.seasonName.split(' ')[1] }}
              </span>
              <span class="font-label-md text-caption text-primary bg-primary-fixed px-2 py-0.5 rounded-full">
                {{ phase.seasonPeriod }}
              </span>
            </div>

            <div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">
                {{ phase.crop.name }}
              </h3>
              <p class="font-label-md text-caption text-primary font-body-bold">
                {{ phase.crop.variety }} ({{ phase.crop.cycleDays }} jours)
              </p>
            </div>

            <div class="rounded-xl overflow-hidden h-36 w-full relative">
              <img :src="phase.crop.imageUrl" :alt="phase.crop.name" class="w-full h-full object-cover" />
              <div class="absolute bottom-2 left-2 px-2 py-0.5 bg-inverse-surface/80 text-inverse-on-surface text-[10px] rounded backdrop-blur-sm">
                Rendement visé : {{ phase.plannedYieldTonnesHa }} t/ha
              </div>
            </div>

            <p class="font-caption text-caption text-on-surface-variant">
              {{ phase.notes }}
            </p>
          </div>

          <div class="p-3 bg-surface-container-low rounded-xl flex items-center justify-between text-caption">
            <span>Fixation N₂ : <strong>{{ phase.crop.nitrogenFixationKgHa }} kg/ha</strong></span>
            <span>Marge : <strong class="text-secondary">{{ phase.grossMarginFcfaHa.toLocaleString('fr-FR') }} FCFA</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Algorithmic Criteria Evaluation ("Pourquoi ce score ?") -->
    <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="font-headline-sm text-headline-sm text-on-surface">
          Pédagogie de l'Algorithme : Pourquoi {{ scenario.overallScore }}/100 ?
        </h3>
        <span class="font-label-md text-caption text-on-surface-variant">Multi-critères NASA &amp; IRAD</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-surface-container-low p-4 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-body-bold text-label-md text-on-surface">Adéquation Pluie</span>
            <span class="font-body-bold text-label-md text-primary">{{ scenario.radarScores.waterSecurity }}%</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full" :style="{ width: `${scenario.radarScores.waterSecurity}%` }"></div>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Cycles calés sur la mousson bimodale du Centre sans chevauchement critique sur la pause sèche.
          </p>
        </div>

        <div class="bg-surface-container-low p-4 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-body-bold text-label-md text-on-surface">Fertilité Naturelle</span>
            <span class="font-body-bold text-label-md text-primary">{{ scenario.radarScores.soilFertility }}%</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full" :style="{ width: `${scenario.radarScores.soilFertility}%` }"></div>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Régénération d'azote symbiotique par le niébé réduisant de 60% la facture d'engrais minéral.
          </p>
        </div>

        <div class="bg-surface-container-low p-4 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-body-bold text-label-md text-on-surface">Valorisation Marché</span>
            <span class="font-body-bold text-label-md text-secondary">{{ scenario.radarScores.fcfaMargin }}%</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div class="bg-secondary h-full rounded-full" :style="{ width: `${scenario.radarScores.fcfaMargin}%` }"></div>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Forte demande sur les marchés de gros d'Obala et Yaoundé pour le grain et les tubercules.
          </p>
        </div>

        <div class="bg-surface-container-low p-4 rounded-xl space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-body-bold text-label-md text-on-surface">Sécurité Foyer</span>
            <span class="font-body-bold text-label-md text-primary">{{ scenario.radarScores.foodDiversification }}%</span>
          </div>
          <div class="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full" :style="{ width: `${scenario.radarScores.foodDiversification}%` }"></div>
          </div>
          <p class="font-caption text-caption text-on-surface-variant">
            Diversification sur 3 familles végétales distinctes garantissant un filet vivrier continu.
          </p>
        </div>
      </div>
    </div>

    <!-- Soil Profile Strip -->
    <div class="bg-surface-container-high/60 rounded-2xl p-5 border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-xs">
          <span class="material-symbols-outlined text-[26px]">terrain</span>
        </div>
        <div>
          <h4 class="font-headline-sm text-headline-sm text-on-surface">Sol Ferrallitique Rouge d'Obala</h4>
          <p class="font-body-md text-caption sm:text-body-md text-on-surface-variant">
            Texture argilo-limoneuse, pH moyen 6.2, bonne rétention racinaire mais sensible au lessivage.
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl shadow-xs text-on-surface text-caption font-body-bold">
        <span class="material-symbols-outlined text-secondary text-[20px]">lightbulb</span>
        <span>Recommandation : Paillage post-récolte conseillé</span>
      </div>
    </div>

    <!-- Mandatory Ethical Transparency & Model Limits Warning -->
    <div class="bg-secondary-fixed/30 rounded-2xl p-5 border border-secondary/40 flex items-start gap-3 shadow-xs">
      <div class="w-10 h-10 rounded-full bg-secondary-fixed-dim/40 flex items-center justify-center text-secondary shrink-0 mt-0.5">
        <span class="material-symbols-outlined text-[22px]">verified_user</span>
      </div>
      <div class="space-y-1">
        <h4 class="font-body-bold text-label-lg text-on-secondary-fixed">
          Estimation indicative, pas une prévision de rendement.
        </h4>
        <p class="font-body-md text-caption sm:text-body-md text-on-secondary-fixed-variant leading-relaxed">
          Les scores et projections fournies sont indicatifs et basés sur les séries historiques NASA (2004-2024) et les observations satellitaires en temps quasi-réel. Elles ne constituent pas une garantie de rendement absolu. Les pratiques paysannes locales, la qualité des semences certifiées et les aléas micro-climatiques imprévisibles restent déterminants.
        </p>
      </div>
    </div>
  </div>
</template>
