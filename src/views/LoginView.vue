<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import AppButton from '@/components/common/AppButton.vue';
import loginHeroImage from '@/assets/login-field.jpg';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const appStore = useAppStore();
const tr = appStore.tr;

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);

const submit = async () => {
  error.value = null;
  if (!email.value.trim() || !password.value) {
    error.value = tr('Enter your email and password.', 'Saisissez votre email et votre mot de passe.');
    return;
  }
  try {
    await auth.login({ email: email.value.trim(), password: password.value });
    const target = (route.query.redirect as string) || '/dashboard';
    router.push(target);
  } catch (e: any) {
    error.value = e?.message || tr('Sign in failed.', 'Connexion impossible.');
  }
};

const fillDemo = (targetEmail = 'industrialteam@agropredict.cm') => {
  email.value = targetEmail;
  password.value = 'Password123!';
  error.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col lg:flex-row">
    <!-- Brand panel -->
    <aside class="relative overflow-hidden lg:w-[46%] bg-primary text-on-primary flex flex-col justify-between p-8 sm:p-12">
      <!-- Background farm image with green gradient overlay -->
      <img
        :src="loginHeroImage"
        alt="AgroPredict fields"
        class="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary/95 pointer-events-none"></div>
      <div class="absolute inset-0 bg-primary/25 backdrop-blur-[0.5px] pointer-events-none"></div>

      <div class="relative z-10 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
          <span class="material-symbols-outlined text-[28px] text-white">agriculture</span>
        </div>
        <div>
          <p class="font-headline-sm text-headline-sm font-bold leading-none text-white">AgroPredict</p>
          <p class="font-caption text-caption text-primary-fixed/90">NASA Earth × IRAD Cameroon</p>
        </div>
      </div>

      <div class="relative z-10 space-y-6 max-w-md my-10">
        <h2 class="font-display-lg text-headline-lg font-bold leading-tight text-white drop-shadow-sm">
          {{ tr('Crop decisions powered by Earth observation.', "Des décisions culturales éclairées par l'espace.") }}
        </h2>
        <p class="font-body-md text-body-md text-primary-fixed/95">
          {{
            tr(
              'Sign in to plan crop rotations with live NASA POWER rainfall, soil wetness and reference yields for your own plots.',
              'Connectez-vous pour planifier vos rotations avec les données NASA POWER en direct, l’humidité du sol et les rendements de référence de vos parcelles.',
            )
          }}
        </p>
        <ul class="space-y-2.5 font-body-md text-caption text-white/95">
          <li class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[20px] text-primary-fixed">satellite_alt</span>
            <span>{{ tr('Live POWER telemetry per plot', 'Télémétrie POWER en direct par parcelle') }}</span>
          </li>
          <li class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[20px] text-primary-fixed">autorenew</span>
            <span>{{ tr('3-season rotation scoring engine', 'Moteur de notation de rotations sur 3 saisons') }}</span>
          </li>
          <li class="flex items-center gap-2.5">
            <span class="material-symbols-outlined text-[20px] text-primary-fixed">savings</span>
            <span>{{ tr('FCFA margins from reference prices', 'Marges FCFA sur prix de référence') }}</span>
          </li>
        </ul>
      </div>

      <p class="relative z-10 font-caption text-[11px] text-primary-fixed/75">
        {{ appStore.t('app.disclaimer') }}
      </p>
    </aside>

    <!-- Form panel -->
    <main class="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-sm space-y-5">
        <div class="space-y-1">
          <h1 class="font-headline-lg text-headline-lg text-on-surface">
            {{ tr('Welcome back', 'Bon retour') }}
          </h1>
          <p class="font-body-md text-caption text-on-surface-variant">
            {{ tr('Sign in to your AgroPredict account.', 'Connectez-vous à votre compte AgroPredict.') }}
          </p>
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <label class="block space-y-1">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Email', 'Email') }}</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </label>

          <label class="block space-y-1">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Password', 'Mot de passe') }}</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </label>

          <p
            v-if="error"
            class="text-error font-caption text-caption bg-error-container/30 border border-error/30 rounded-xl px-3 py-2"
          >
            {{ error }}
          </p>

          <AppButton type="submit" variant="primary" size="lg" :full-width="true" icon="login" :disabled="auth.loading">
            {{ auth.loading ? tr('Signing in…', 'Connexion…') : tr('Sign in', 'Se connecter') }}
          </AppButton>
        </form>

        <!-- Quick demo credentials card -->
        <div class="p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-1.5 text-left">
          <div class="flex items-center justify-between text-caption font-label-md">
            <span class="flex items-center gap-1 font-bold text-primary">
              <span class="material-symbols-outlined text-[15px]">key</span>
              {{ tr('Demo account', 'Compte démo') }}
            </span>
            <button
              type="button"
              class="text-primary font-bold hover:underline cursor-pointer text-[12px]"
              @click="fillDemo('industrialteam@agropredict.cm')"
            >
              {{ tr('Fill credentials', 'Remplir auto') }}
            </button>
          </div>
          <p class="font-mono text-[11px] text-on-surface-variant select-all">
            industrialteam@agropredict.cm &bull; Password123!
          </p>
        </div>

        <p class="font-body-md text-caption text-on-surface-variant text-center">
          {{ tr('No account yet?', 'Pas encore de compte ?') }}
          <RouterLink to="/register" class="text-primary font-bold hover:underline">
            {{ tr('Create one', 'Créer un compte') }}
          </RouterLink>
        </p>

        <button
          type="button"
          class="w-full text-center font-caption text-caption text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          @click="appStore.toggleLanguage"
        >
          {{ appStore.language === 'en' ? 'Passer en français' : 'Switch to English' }}
        </button>
      </div>
    </main>
  </div>
</template>
