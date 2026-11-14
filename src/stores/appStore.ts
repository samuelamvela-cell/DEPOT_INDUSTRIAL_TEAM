import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { messages, type SupportedLocale } from '@/i18n';

export const useAppStore = defineStore('app', () => {
  // English is the main and default language as requested
  const storedLang = typeof window !== 'undefined' ? (localStorage.getItem('agropredict_lang') as SupportedLocale | null) : null;
  const language = ref<SupportedLocale>(storedLang || 'en');
  const currency = ref<'FCFA' | 'USD'>('FCFA');
  const surfaceUnit = ref<'ha' | 'piquet'>('ha');
  const isOffline = ref(false);
  const isSyncing = ref(false);

  const toggleLanguage = () => {
    setLanguage(language.value === 'en' ? 'fr' : 'en');
  };

  const setLanguage = (lang: SupportedLocale) => {
    language.value = lang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('agropredict_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleCurrency = () => {
    currency.value = currency.value === 'FCFA' ? 'USD' : 'FCFA';
  };

  const setOfflineMode = (val: boolean) => {
    isOffline.value = val;
  };

  // Reactive translation helper
  const t = computed(() => {
    return (keyPath: string, params?: Record<string, string | number>): string => {
      const currentMessages = messages[language.value] as Record<string, any>;
      const fallbackMessages = messages.en as Record<string, any>;

      const keys = keyPath.split('.');
      let current: any = currentMessages;
      let fallback: any = fallbackMessages;

      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          current = undefined;
        }

        if (fallback && typeof fallback === 'object' && key in fallback) {
          fallback = fallback[key];
        } else {
          fallback = undefined;
        }
      }

      let result = typeof current === 'string' ? current : (typeof fallback === 'string' ? fallback : keyPath);

      if (params) {
        for (const [pKey, pVal] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        }
      }

      return result;
    };
  });

  return {
    language,
    currency,
    surfaceUnit,
    isOffline,
    isSyncing,
    toggleLanguage,
    setLanguage,
    toggleCurrency,
    setOfflineMode,
    t,
  };
});
