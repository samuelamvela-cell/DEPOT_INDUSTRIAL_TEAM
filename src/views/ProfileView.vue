<script setup lang="ts">
import { ref } from 'vue';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore } from '@/stores/appStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const farmStore = useFarmStore();
const appStore = useAppStore();

const savedToast = ref(false);
const cachePurgedToast = ref(false);

const handleSave = () => {
  savedToast.value = true;
  setTimeout(() => {
    savedToast.value = false;
  }, 2500);
};

const handlePurge = () => {
  cachePurgedToast.value = true;
  setTimeout(() => {
    cachePurgedToast.value = false;
  }, 2500);
};

const handleDownloadPack = () => {
  alert("Téléchargement du Pack Hors-ligne Lékié (18 Mo de modèles locaux et tuiles vectorielles)...");
  farmStore.user.offlineStorage.packLekieDownloaded = true;
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <!-- Top Action & Navigation Status Bar -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md tracking-wider uppercase">
          <span class="material-symbols-outlined text-[18px]">manage_accounts</span>
          <span>Espace Conseiller de Terrain</span>
          <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
          <span class="text-on-surface-variant font-caption text-caption lowercase">nasa sync v2.4</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mt-1">Profil &amp; Paramètres</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 max-w-2xl">
          Gérez votre compte conseiller, vos préférences linguistiques, le stockage hors-ligne et vos unités agronomiques.
        </p>
      </div>

      <div class="flex items-center gap-2.5 self-start md:self-auto">
        <AppButton variant="primary" icon="save" @click="handleSave">
          Enregistrer les préférences
        </AppButton>
      </div>
    </div>

    <!-- Feedback Toast -->
    <div
      v-if="savedToast"
      class="p-3 bg-primary text-on-primary rounded-xl font-label-md text-caption text-center shadow-md animate-in fade-in"
    >
      ✓ Vos préférences ont été enregistrées avec succès sur cet appareil !
    </div>
    <div
      v-if="cachePurgedToast"
      class="p-3 bg-secondary text-on-secondary rounded-xl font-label-md text-caption text-center shadow-md animate-in fade-in"
    >
      ✓ Cache temporaire purgé. Les données essentielles restent protégées.
    </div>

    <!-- User Identity & Field Context Banner (Bento Main Card) -->
    <div class="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden p-6 sm:p-8">
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary-fixed/30 to-transparent pointer-events-none blur-3xl"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <!-- Advisor Avatar with status pulse ring -->
          <div class="relative">
            <img
              alt="Michel Ngoa"
              class="w-24 h-24 rounded-2xl object-cover shadow-sm ring-4 ring-primary/20"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
            />
            <div class="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-sm" title="Conseiller Vérifié">
              <span class="material-symbols-outlined text-[16px]">verified</span>
            </div>
          </div>

          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-headline-md text-headline-md text-on-surface">{{ farmStore.user.name }}</h2>
              <AppBadge variant="primary">Compte Certifié</AppBadge>
              <AppBadge variant="secondary">Expert Agro-Écologique</AppBadge>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant">
              {{ farmStore.user.role }} • {{ farmStore.user.matricule }}
            </p>
            <div class="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-caption text-on-surface-variant">
              <div class="flex items-center gap-1 text-on-surface">
                <span class="material-symbols-outlined text-primary text-[18px]">corporate_fare</span>
                <span class="font-body-bold">{{ farmStore.user.organization }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="material-symbols-outlined text-primary-container text-[18px]">chat</span>
                <span class="font-body-bold text-on-surface">{{ farmStore.user.phone }}</span>
                <span class="px-1.5 py-0.2 rounded bg-surface-container font-label-md text-[10px] text-primary">WhatsApp Actif</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Parcelles count tag -->
        <div class="bg-surface-container-low rounded-xl p-4 flex flex-row lg:flex-col justify-between items-center lg:items-start gap-2 w-full lg:w-60 border border-outline-variant/30">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-tertiary text-[20px]">radar</span>
            <div>
              <p class="font-caption text-caption text-on-surface-variant">Secteur couvert</p>
              <p class="font-body-bold text-label-lg text-on-surface">{{ farmStore.user.sectorCovered.split('(')[0] }}</p>
            </div>
          </div>
          <div class="text-right lg:text-left">
            <p class="font-caption text-caption text-on-surface-variant">Parcelles suivies</p>
            <p class="font-headline-sm text-headline-sm text-primary font-bold">{{ farmStore.user.parcellesCount }} Exploitations</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Grid: Regional Preferences vs Offline & Data Mode -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Regional Settings & Units (7 cols) -->
      <div class="lg:col-span-7 space-y-6">
        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-5">
          <div class="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
                <span class="material-symbols-outlined text-[24px]">translate</span>
              </div>
              <div>
                <h3 class="font-headline-sm text-headline-sm text-on-surface">Préférences Régionales &amp; Langue</h3>
                <p class="font-caption text-caption text-on-surface-variant">Adaptation culturelle et monétaire pour le terrain</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-caption">Afrique Centrale</span>
          </div>

          <!-- Language Selector -->
          <div class="space-y-2">
            <label class="block font-label-md text-label-md text-on-surface">Langue de l'interface</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                :class="[
                  'p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
                  appStore.language === 'fr'
                    ? 'border-primary bg-primary-fixed/20 text-on-surface font-body-bold shadow-xs'
                    : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
                ]"
                @click="appStore.language = 'fr'"
              >
                <span>Français (Cameroun)</span>
                <span v-if="appStore.language === 'fr'" class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              </button>
              <button
                type="button"
                :class="[
                  'p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
                  appStore.language === 'en'
                    ? 'border-primary bg-primary-fixed/20 text-on-surface font-body-bold shadow-xs'
                    : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
                ]"
                @click="appStore.language = 'en'"
              >
                <span>English (Cameroon)</span>
                <span v-if="appStore.language === 'en'" class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
              </button>
            </div>
          </div>

          <!-- Currency Selector -->
          <div class="space-y-2">
            <label class="block font-label-md text-label-md text-on-surface">Devise d'affichage des marges</label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                :class="[
                  'p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
                  appStore.currency === 'FCFA'
                    ? 'border-secondary bg-secondary-fixed/20 text-on-surface font-body-bold shadow-xs'
                    : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
                ]"
                @click="appStore.currency = 'FCFA'"
              >
                <div>
                  <p class="font-body-bold">Franc CFA (XAF)</p>
                  <p class="font-caption text-caption text-on-surface-variant">Monnaie locale d'Afrique Centrale</p>
                </div>
                <span v-if="appStore.currency === 'FCFA'" class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              </button>
              <button
                type="button"
                :class="[
                  'p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
                  appStore.currency === 'USD'
                    ? 'border-secondary bg-secondary-fixed/20 text-on-surface font-body-bold shadow-xs'
                    : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
                ]"
                @click="appStore.currency = 'USD'"
              >
                <div>
                  <p class="font-body-bold">Dollar US ($ USD)</p>
                  <p class="font-caption text-caption text-on-surface-variant">Rapports internationaux &amp; bailleurs</p>
                </div>
                <span v-if="appStore.currency === 'USD'" class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
              </button>
            </div>
          </div>

          <!-- Agronomic Units Selector -->
          <div class="space-y-2">
            <label class="block font-label-md text-label-md text-on-surface">Unités agronomiques usuelles</label>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <p class="font-caption text-caption text-on-surface-variant">Superficie</p>
                <p class="font-body-bold text-label-lg text-on-surface mt-0.5">Hectares (ha) &amp; Piquets (625 m²)</p>
              </div>
              <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
                <p class="font-caption text-caption text-on-surface-variant">Récolte &amp; Rendements</p>
                <p class="font-body-bold text-label-lg text-on-surface mt-0.5">Tonnes / ha &amp; Sacs de 100 kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Offline Mode & Cache Storage (5 cols) -->
      <div class="lg:col-span-5 space-y-6">
        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b border-outline-variant/20">
            <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[24px]">offline_pin</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">Gestionnaire Hors-Ligne (PWA)</h3>
              <p class="font-caption text-caption text-on-surface-variant">Stockage local pour travail en zone blanche</p>
            </div>
          </div>

          <!-- Storage gauge -->
          <div class="space-y-2">
            <div class="flex items-center justify-between font-label-md text-label-md">
              <span class="text-on-surface-variant">Espace local utilisé :</span>
              <strong class="text-primary font-body-bold">
                {{ farmStore.user.offlineStorage.usedMb }} Mo / {{ farmStore.user.offlineStorage.totalMb }} Mo
              </strong>
            </div>
            <div class="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
              <div
                class="bg-primary h-full rounded-full transition-all"
                :style="{ width: `${(farmStore.user.offlineStorage.usedMb / farmStore.user.offlineStorage.totalMb) * 100}%` }"
              ></div>
            </div>
            <p class="font-caption text-caption text-on-surface-variant">
              113 Mo disponibles pour les cartes et matrices communales supplémentaires.
            </p>
          </div>

          <!-- Pack Lékié Preload Status -->
          <div class="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[20px]">folder_zip</span>
                <span class="font-body-bold text-label-lg text-on-surface">Pack Régional Lékié (18 Mo)</span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-caption text-caption font-semibold">
                {{ farmStore.user.offlineStorage.packLekieDownloaded ? 'Enregistré' : 'Disponible' }}
              </span>
            </div>
            <p class="font-caption text-caption text-on-surface-variant">
              Comprend les 20 années d’historique pluviométrique IMERG et les matrices pédologiques d’Obala, Sa’a, Monatélé.
            </p>
            <AppButton
              variant="secondary"
              size="sm"
              :full-width="true"
              icon="download"
              @click="handleDownloadPack"
            >
              {{ farmStore.user.offlineStorage.packLekieDownloaded ? 'Réactualiser le Pack Lékié' : 'Télécharger le Pack Lékié' }}
            </AppButton>
          </div>

          <!-- Purge cache action -->
          <div class="pt-2">
            <AppButton
              variant="outline"
              size="sm"
              :full-width="true"
              icon="delete_sweep"
              @click="handlePurge"
            >
              Vider le cache temporaire
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
