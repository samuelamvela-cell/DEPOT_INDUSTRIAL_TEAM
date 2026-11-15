<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore, REGIONS, type RegionLabel } from '@/stores/appStore';
import AppButton from '@/components/common/AppButton.vue';

const router = useRouter();
const auth = useAuthStore();
const appStore = useAppStore();
const tr = appStore.tr;

const name = ref('');
const email = ref('');
const organization = ref('');
const phone = ref('');
const region = ref<RegionLabel>(appStore.region);
const password = ref('');
const confirm = ref('');
const error = ref<string | null>(null);

const submit = async () => {
  error.value = null;
  if (name.value.trim().length < 2) {
    error.value = tr('Please enter your full name.', 'Veuillez saisir votre nom complet.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    error.value = tr('Please enter a valid email address.', 'Veuillez saisir un email valide.');
    return;
  }
  if (password.value.length < 8) {
    error.value = tr('Password must be at least 8 characters.', 'Le mot de passe doit contenir au moins 8 caractères.');
    return;
  }
  if (password.value !== confirm.value) {
    error.value = tr('Passwords do not match.', 'Les mots de passe ne correspondent pas.');
    return;
  }

  try {
    await auth.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      organization: organization.value.trim() || undefined,
      phone: phone.value.trim() || undefined,
      region: region.value,
      language: appStore.language,
    });
    appStore.setRegion(region.value);
    router.push('/onboarding');
  } catch (e: any) {
    error.value = e?.message || tr('Registration failed.', 'Inscription impossible.');
  }
};
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-2xl space-y-6">
      <div class="flex items-center justify-between">
        <RouterLink to="/login" class="flex items-center gap-2 text-primary font-body-bold text-label-lg hover:underline">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          {{ tr('Back to sign in', 'Retour à la connexion') }}
        </RouterLink>
        <button
          type="button"
          class="font-caption text-caption text-on-surface-variant hover:text-primary cursor-pointer"
          @click="appStore.toggleLanguage"
        >
          {{ appStore.language === 'en' ? 'Passer en français' : 'Switch to English' }}
        </button>
      </div>

      <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm p-6 sm:p-8 space-y-6">
        <div class="space-y-1">
          <h1 class="font-headline-lg text-headline-lg text-on-surface">
            {{ tr('Create your account', 'Créer votre compte') }}
          </h1>
          <p class="font-body-md text-caption text-on-surface-variant">
            {{
              tr(
                'Your plots, rotations and telemetry stay attached to this account.',
                'Vos parcelles, rotations et données de télémétrie restent rattachées à ce compte.',
              )
            }}
          </p>
        </div>

        <form class="grid grid-cols-1 sm:grid-cols-2 gap-4" @submit.prevent="submit">
          <label class="block space-y-1 sm:col-span-2">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Full name', 'Nom complet') }}</span>
            <input
              v-model="name"
              type="text"
              autocomplete="name"
              required
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Awa Tchoumi"
            />
          </label>

          <label class="block space-y-1">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Email', 'Email') }}</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </label>

          <label class="block space-y-1">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Phone (optional)', 'Téléphone (optionnel)') }}</span>
            <input
              v-model="phone"
              type="tel"
              autocomplete="tel"
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="+237 6XX XX XX XX"
            />
          </label>

          <label class="block space-y-1 sm:col-span-2">
            <span class="font-label-md text-caption text-on-surface-variant">
              {{ tr('Cooperative / organisation (optional)', 'Coopérative / organisation (optionnel)') }}
            </span>
            <input
              v-model="organization"
              type="text"
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              :placeholder="tr('Lékié Planters Cooperative', 'Coopérative des Planteurs de Lékié')"
            />
          </label>

          <label class="block space-y-1 sm:col-span-2">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Main region', 'Région principale') }}</span>
            <select
              v-model="region"
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option v-for="r in REGIONS" :key="r.label" :value="r.label">
                {{ appStore.t(r.key) }} — {{ appStore.t(r.zoneKey) }}
              </option>
            </select>
          </label>

          <label class="block space-y-1">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Password', 'Mot de passe') }}</span>
            <input
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </label>

          <label class="block space-y-1">
            <span class="font-label-md text-caption text-on-surface-variant">{{ tr('Confirm password', 'Confirmer le mot de passe') }}</span>
            <input
              v-model="confirm"
              type="password"
              autocomplete="new-password"
              required
              class="w-full px-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/50 font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </label>

          <p
            v-if="error"
            class="sm:col-span-2 text-error font-caption text-caption bg-error-container/30 border border-error/30 rounded-xl px-3 py-2"
          >
            {{ error }}
          </p>

          <div class="sm:col-span-2 pt-1">
            <AppButton type="submit" variant="primary" size="lg" :full-width="true" icon="person_add" :disabled="auth.loading">
              {{ auth.loading ? tr('Creating account…', 'Création du compte…') : tr('Create account', 'Créer le compte') }}
            </AppButton>
          </div>
        </form>

        <p class="font-caption text-[11px] text-on-surface-variant text-center">
          {{ appStore.t('app.disclaimer') }}
        </p>
      </div>
    </div>
  </div>
</template>
