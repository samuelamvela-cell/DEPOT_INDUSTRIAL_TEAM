<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useFarmStore } from '@/stores/farmStore';
import { useAppStore, REGIONS, type RegionLabel } from '@/stores/appStore';
import AppBadge from '@/components/common/AppBadge.vue';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const auth = useAuthStore();
const farmStore = useFarmStore();
const appStore = useAppStore();
const tr = appStore.tr;

const savedToast = ref(false);
const errorMsg = ref<string | null>(null);

const user = computed(() => auth.user);

const form = reactive({
  name: user.value?.name || '',
  organization: user.value?.organization || '',
  phone: user.value?.phone || '',
  region: user.value?.region || 'Lékié',
});

const initials = computed(() =>
  (user.value?.name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join(''),
);

const memberSince = computed(() => {
  const at = user.value?.createdAt;
  if (!at) return '—';
  return new Date(at).toLocaleDateString(appStore.language === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long' });
});

const totalHa = computed(() => farmStore.plots.reduce((sum, p) => sum + p.surfaceHa, 0));

const persist = async (patch: Record<string, unknown>) => {
  errorMsg.value = null;
  try {
    await auth.updateProfile(patch as any);
    savedToast.value = true;
    setTimeout(() => (savedToast.value = false), 2500);
  } catch (e: any) {
    errorMsg.value = e?.message || tr('Could not save your account.', 'Impossible d’enregistrer votre compte.');
  }
};

const selectLanguage = async (lang: 'en' | 'fr') => {
  appStore.setLanguage(lang);
  await persist({ language: lang });
};

const selectCurrency = async (currency: 'FCFA' | 'USD') => {
  appStore.currency = currency;
  await persist({ currency });
};

const selectSurfaceUnit = async (unit: 'ha' | 'piquet') => {
  appStore.surfaceUnit = unit;
  await persist({ surfaceUnit: unit });
};

const signOut = () => {
  auth.logout();
  farmStore.reset();
  router.push('/login');
};
</script>

<template>
  <div class="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl mx-auto w-full">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-primary font-label-md text-label-md tracking-wider uppercase">
          <span class="material-symbols-outlined text-[18px]">manage_accounts</span>
          <span>{{ appStore.t('app.advisorRole') }}</span>
        </div>
        <h1 class="font-headline-lg text-headline-lg text-on-surface mt-1">{{ appStore.t('profile.title') }}</h1>
        <p class="font-body-md text-body-md text-on-surface-variant mt-0.5 max-w-2xl">{{ appStore.t('profile.subtitle') }}</p>
      </div>
      <AppButton variant="primary" icon="save" :disabled="auth.loading" @click="persist({ ...form })">
        {{ appStore.t('profile.saveBtn') }}
      </AppButton>
    </div>

    <p v-if="savedToast" class="p-3 bg-primary text-on-primary rounded-xl font-label-md text-caption text-center shadow-md">
      {{ tr('✓ Your account has been updated.', '✓ Votre compte a été mis à jour.') }}
    </p>
    <p v-if="errorMsg" class="p-3 bg-error-container text-on-error-container rounded-xl font-label-md text-caption text-center shadow-md">
      {{ errorMsg }}
    </p>

    <!-- Identity -->
    <div class="relative bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden p-6 sm:p-8">
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary-fixed/30 to-transparent pointer-events-none blur-3xl"></div>

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div class="w-20 h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md ring-4 ring-primary/20">
            {{ initials }}
          </div>
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-headline-md text-headline-md text-on-surface">{{ user?.name || '—' }}</h2>
              <AppBadge variant="primary">{{ user?.role || tr('Advisor', 'Conseiller') }}</AppBadge>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant">{{ user?.email }}</p>
            <div class="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-caption text-on-surface-variant">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-primary text-[18px]">corporate_fare</span>
                <span class="font-body-bold text-on-surface">{{ user?.organization || tr('Not set', 'Non renseigné') }}</span>
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-primary-container text-[18px]">call</span>
                <span class="font-body-bold text-on-surface">{{ user?.phone || tr('Not set', 'Non renseigné') }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="bg-surface-container-low rounded-xl p-4 flex flex-row lg:flex-col justify-between items-center lg:items-start gap-2 w-full lg:w-60 border border-outline-variant/30">
          <div>
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Plots monitored', 'Parcelles suivies') }}</p>
            <p class="font-headline-sm text-headline-sm text-primary font-bold">{{ farmStore.plots.length }}</p>
          </div>
          <div class="text-right lg:text-left">
            <p class="font-caption text-caption text-on-surface-variant">{{ tr('Total surface', 'Surface totale') }}</p>
            <p class="font-body-bold text-label-lg text-on-surface">{{ totalHa.toFixed(1) }} ha</p>
          </div>
          <p class="font-caption text-[11px] text-on-surface-variant w-full">{{ tr('Member since', 'Membre depuis') }} {{ memberSince }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div class="lg:col-span-7 space-y-6">
        <!-- Account details -->
        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b border-outline-variant/20">
            <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[24px]">badge</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Account details', 'Détails du compte') }}</h3>
              <p class="font-caption text-caption text-on-surface-variant">{{ tr('Stored on the AgroPredict server.', 'Enregistré sur le serveur AgroPredict.') }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Full name', 'Nom complet') }}</label>
              <input v-model="form.name" type="text" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Organization', 'Organisation') }}</label>
              <input v-model="form.organization" type="text" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Phone', 'Téléphone') }}</label>
              <input v-model="form.phone" type="tel" placeholder="+237 6xx xx xx xx" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Region', 'Région') }}</label>
              <select v-model="form.region" class="w-full h-12 px-3.5 bg-surface-container-low rounded-xl font-body-md text-on-surface border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                <option v-for="r in REGIONS" :key="r.label" :value="r.label">{{ appStore.t(r.key) }}</option>
              </select>
            </div>
            <div>
              <label class="block font-label-md text-label-md text-on-surface mb-1">{{ tr('Email (sign-in)', 'Email (connexion)') }}</label>
              <input :value="user?.email" type="email" disabled class="w-full h-12 px-3.5 bg-surface-container rounded-xl font-body-md text-on-surface-variant border border-outline-variant/30" />
            </div>
          </div>
        </div>

        <!-- Language -->
        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-4">
          <div class="flex items-center gap-3 pb-2 border-b border-outline-variant/20">
            <div class="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary">
              <span class="material-symbols-outlined text-[24px]">translate</span>
            </div>
            <div>
              <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ appStore.t('profile.langTitle') }}</h3>
              <p class="font-caption text-caption text-on-surface-variant">{{ appStore.t('profile.langDesc') }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              :class="[
                'p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
                appStore.language === 'en' ? 'border-primary bg-primary-fixed/20 font-body-bold shadow-xs' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
              ]"
              @click="selectLanguage('en')"
            >
              <div>
                <span class="block">English</span>
                <span class="text-[11px] text-on-surface-variant">{{ tr('Default', 'Par défaut') }}</span>
              </div>
              <span v-if="appStore.language === 'en'" class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            </button>
            <button
              type="button"
              :class="[
                'p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
                appStore.language === 'fr' ? 'border-primary bg-primary-fixed/20 font-body-bold shadow-xs' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
              ]"
              @click="selectLanguage('fr')"
            >
              <div>
                <span class="block">Français</span>
                <span class="text-[11px] text-on-surface-variant">{{ tr('Secondary', 'Secondaire') }}</span>
              </div>
              <span v-if="appStore.language === 'fr'" class="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            </button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <!-- Currency -->
        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Display currency', 'Devise d’affichage') }}</h3>
          <button
            type="button"
            :class="[
              'w-full p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
              appStore.currency === 'FCFA' ? 'border-secondary bg-secondary-fixed/20 shadow-xs' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
            ]"
            @click="selectCurrency('FCFA')"
          >
            <div>
              <p class="font-body-bold">Franc CFA (XAF)</p>
              <p class="font-caption text-caption text-on-surface-variant">{{ tr('Local currency', 'Monnaie locale') }}</p>
            </div>
            <span v-if="appStore.currency === 'FCFA'" class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          </button>
          <button
            type="button"
            :class="[
              'w-full p-3.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all',
              appStore.currency === 'USD' ? 'border-secondary bg-secondary-fixed/20 shadow-xs' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
            ]"
            @click="selectCurrency('USD')"
          >
            <div>
              <p class="font-body-bold">US Dollar (USD)</p>
              <p class="font-caption text-caption text-on-surface-variant">{{ tr('Reports and donors', 'Rapports et bailleurs') }}</p>
            </div>
            <span v-if="appStore.currency === 'USD'" class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          </button>
        </div>

        <!-- Surface unit -->
        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-3">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Surface unit', 'Unité de superficie') }}</h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              :class="[
                'p-3 rounded-xl border text-left cursor-pointer transition-all',
                appStore.surfaceUnit === 'ha' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
              ]"
              @click="selectSurfaceUnit('ha')"
            >
              <p class="font-body-bold">Hectare</p>
              <p class="font-caption text-caption text-on-surface-variant">ha</p>
            </button>
            <button
              type="button"
              :class="[
                'p-3 rounded-xl border text-left cursor-pointer transition-all',
                appStore.surfaceUnit === 'piquet' ? 'border-primary bg-primary-fixed/20' : 'border-outline-variant/30 bg-surface-container-low text-on-surface-variant',
              ]"
              @click="selectSurfaceUnit('piquet')"
            >
              <p class="font-body-bold">{{ tr('Piquets', 'Piquets') }}</p>
              <p class="font-caption text-caption text-on-surface-variant">625 m²</p>
            </button>
          </div>
        </div>

        <div class="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-sm space-y-2">
          <h3 class="font-headline-sm text-headline-sm text-on-surface">{{ tr('Session', 'Session') }}</h3>
          <p class="font-caption text-caption text-on-surface-variant">
            {{ tr('Signed in with an email and password on this device.', 'Connecté par email et mot de passe sur cet appareil.') }}
          </p>
          <AppButton variant="outline" size="sm" :full-width="true" icon="logout" @click="signOut">
            {{ tr('Sign out', 'Se déconnecter') }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
