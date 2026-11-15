import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, ApiError, tokenStore } from '@/services/api';
import type { AuthUser } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(tokenStore.get());
  const loading = ref(false);
  const bootstrapped = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const displayName = computed(() => user.value?.name || '');
  const firstName = computed(() => (user.value?.name || '').split(' ')[0] || '');

  function apply(res: { token: string; user: AuthUser }) {
    token.value = res.token;
    user.value = res.user;
    tokenStore.set(res.token);
    error.value = null;
  }

  function clear() {
    user.value = null;
    token.value = null;
    tokenStore.clear();
  }

  async function register(payload: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    phone?: string;
    region?: string;
    language?: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      apply(await api.register(payload));
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Registration failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function login(payload: { email: string; password: string }) {
    loading.value = true;
    error.value = null;
    try {
      apply(await api.login(payload));
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Sign in failed';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  /** Restore the session on app start; returns true when a valid session exists. */
  async function bootstrap() {
    if (bootstrapped.value) return isAuthenticated.value;
    bootstrapped.value = true;
    if (!token.value) return false;
    try {
      const { user: me } = await api.me();
      user.value = me;
      return true;
    } catch {
      clear();
      return false;
    }
  }

  async function refresh() {
    if (!token.value) return;
    try {
      const { user: me } = await api.me();
      user.value = me;
    } catch {
      clear();
    }
  }

  async function updateProfile(patch: Parameters<typeof api.updateMe>[0]) {
    const { user: updated } = await api.updateMe(patch);
    user.value = updated;
    return updated;
  }

  function logout() {
    clear();
    bootstrapped.value = true;
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    displayName,
    firstName,
    register,
    login,
    logout,
    bootstrap,
    refresh,
    updateProfile,
  };
});
