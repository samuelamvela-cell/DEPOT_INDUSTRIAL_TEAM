import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { messages, type SupportedLocale } from '@/i18n';

export type RegionLabel = 'Lékié' | 'Obala' | 'Yaoundé' | 'Sud' | 'Nord';

export interface RegionOption {
  label: RegionLabel;
  key: string;        // i18n key for the region name
  zoneKey: string;    // i18n key for the agro-ecological zone description
  lat: number;
  lng: number;
  bimodal: boolean;   // two rainy seasons
}

export const REGIONS: RegionOption[] = [
  { label: 'Lékié',   key: 'dashboard.regionLekie',   zoneKey: 'dashboard.zoneLekie',   lat: 3.98, lng: 11.53, bimodal: true },
  { label: 'Obala',   key: 'dashboard.regionObala',   zoneKey: 'dashboard.zoneObala',   lat: 4.16, lng: 11.53, bimodal: true },
  { label: 'Yaoundé', key: 'dashboard.regionYaounde', zoneKey: 'dashboard.zoneYaounde', lat: 3.85, lng: 11.50, bimodal: true },
  { label: 'Sud',     key: 'dashboard.regionSud',     zoneKey: 'dashboard.zoneSud',     lat: 2.93, lng: 11.15, bimodal: true },
  { label: 'Nord',    key: 'dashboard.regionNord',    zoneKey: 'dashboard.zoneNord',    lat: 9.30, lng: 13.40, bimodal: false },
];

export const useAppStore = defineStore('app', () => {
  // English is the main and default language as requested
  const storedLang = typeof window !== 'undefined' ? (localStorage.getItem('agropredict_lang') as SupportedLocale | null) : null;
  const language = ref<SupportedLocale>(storedLang || 'en');

  // English is the application's primary language: keep the document in sync
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language.value;
  }
  const currency = ref<'FCFA' | 'USD'>('FCFA');
  const surfaceUnit = ref<'ha' | 'piquet'>('ha');

  const storedRegion = typeof window !== 'undefined'
    ? (localStorage.getItem('agropredict_region') as RegionLabel | null)
    : null;
  const region = ref<RegionLabel>(storedRegion || 'Lékié');

  const regionKey = computed(() =>
    REGIONS.find((r) => r.label === region.value)?.key || 'dashboard.regionLekie'
  );

  const activeRegion = computed(
    () => REGIONS.find((r) => r.label === region.value) || REGIONS[0]
  );

  const setRegion = (label: RegionLabel) => {
    region.value = label;
    if (typeof window !== 'undefined') localStorage.setItem('agropredict_region', label);
  };

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

  /** Inline bilingual helper: `tr('Surface', 'Superficie')`. */
  const tr = (en: string, fr: string): string => (language.value === 'fr' ? fr : en);

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
    region,
    regionKey,
    activeRegion,
    setRegion,
    isOffline,
    isSyncing,
    toggleLanguage,
    setLanguage,
    toggleCurrency,
    setOfflineMode,
    t,
    tr,
  };
});
