import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const language = ref<'fr' | 'en'>('fr');
  const currency = ref<'FCFA' | 'USD'>('FCFA');
  const surfaceUnit = ref<'ha' | 'piquet'>('ha');
  const isOffline = ref(false);
  const isSyncing = ref(false);

  const toggleLanguage = () => {
    language.value = language.value === 'fr' ? 'en' : 'fr';
  };

  const toggleCurrency = () => {
    currency.value = currency.value === 'FCFA' ? 'USD' : 'FCFA';
  };

  const setOfflineMode = (val: boolean) => {
    isOffline.value = val;
  };

  return {
    language,
    currency,
    surfaceUnit,
    isOffline,
    isSyncing,
    toggleLanguage,
    toggleCurrency,
    setOfflineMode,
  };
});
