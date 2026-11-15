<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import AppButton from '@/components/common/AppButton.vue';

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
</script>

<template>
  <div class="min-h-screen bg-surface flex flex-col lg:flex-row">
    <!-- Brand panel -->
    <aside class="lg:w-[46%] bg-primary text-on-primary flex flex-col justify-between p-8 sm:p-12">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-[32px]">agriculture</span>
        <div>
          <p class="font-headline-sm text-headline-sm font-bold leading-none">AgroPredict</p>
          <p class="font-caption text-caption text-primary-fixed/80">NASA Earth × IRAD Cameroon</p>
        </div>
      </div>

      <div class="space-y-6 max-w-md my-10">
        <h2 class="font-display-lg text-headline-lg font-bold leading-tight">
          {{ tr('Crop decisions powered by Earth observation.', "Des décisions culturales éclairées par l'espace.") }}
        </h2>
        <p class="font-body-md text-body-md text-primary-fixed/90">
          {{
            tr(
              'Sign in to plan crop rotations with live NASA POWER rainfall, soil wetness and reference yields for your own plots.',
              'Connectez-vous pour planifier vos rotations avec les données NASA POWER en direct, l’humidité du sol et les rendements de référence de vos parcelles.',
            )
          }}
        </p>
        <ul class="space-y-2 font-body-md text-caption text-primary-fixed/85">
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">satellite_alt</span>
            {{ tr('Live POWER telemetry per plot', 'Télémétrie POWER en direct par parcelle') }}
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">autorenew</span>
            {{ tr('3-season rotation scoring engine', 'Moteur de notation de rotations sur 3 saisons') }}
          </li>
          <li class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">savings</span>
            {{ tr('FCFA margins from reference prices', 'Marges FCFA sur prix de référence') }}
          </li>
        </ul>
      </div>

      <p class="font-caption text-[11px] text-primary-fixed/60">
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
