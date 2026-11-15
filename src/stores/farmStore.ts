import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { api, ApiError, type PlotInput } from '@/services/api';
import { buildScenarios } from '@/services/scenarioBuilder';
import { useAppStore } from '@/stores/appStore';
import type {
  ClimateTelemetry,
  Crop,
  FarmPlot,
  RotationScenario,
  SatelliteSource,
  ScoringWeights,
} from '@/types';

const ACTIVE_PLOT_KEY = 'agropredict_active_plot';

export const useFarmStore = defineStore('farm', () => {
  const appStore = useAppStore();

  const crops = ref<Crop[]>([]);
  const plots = ref<FarmPlot[]>([]);
  const activePlotId = ref<string | null>(
    typeof window === 'undefined' ? null : localStorage.getItem(ACTIVE_PLOT_KEY),
  );
  const telemetry = ref<ClimateTelemetry | null>(null);
  const telemetryCache = ref<Record<string, ClimateTelemetry>>({});

  const loadingCrops = ref(false);
  const loadingPlots = ref(false);
  const loadingTelemetry = ref(false);
  const saving = ref(false);

  const cropsError = ref<string | null>(null);
  const plotsError = ref<string | null>(null);
  const telemetryError = ref<string | null>(null);

  const weights = ref<ScoringWeights>({
    waterSecurity: 35,
    fcfaMargin: 30,
    soilFertility: 20,
    foodSecurity: 15,
  });

  const activePlot = computed<FarmPlot | null>(() => {
    if (!plots.value.length) return null;
    return plots.value.find((p) => p.id === activePlotId.value) || plots.value[0];
  });

  const climate = computed(() => telemetry.value);

  /** Crops the user swapped into a phase, keyed by scenario id. */
  const overrides = ref<Record<string, string[]>>({});

  const scenarios = computed<RotationScenario[]>(() =>
    buildScenarios(
      {
        crops: crops.value,
        telemetry: telemetry.value,
        plot: activePlot.value,
        weights: weights.value,
        lang: appStore.language,
        tr: appStore.tr,
      },
      overrides.value,
    ),
  );

  const recommendedScenario = computed(
    () => scenarios.value.find((s) => s.isRecommended) || scenarios.value[0] || null,
  );

  const satelliteSources = computed<SatelliteSource[]>(() => {
    const t = telemetry.value;
    if (!t) return [];
    const fetched = t.provenance.fetchedAt;
    const when = fetched ? new Date(fetched) : null;
    const stamp = when
      ? `${Math.max(1, Math.round((Date.now() - when.getTime()) / 60000))} min`
      : '—';
    return [
      {
        id: 'power_precip',
        name: 'NASA POWER · Precipitation',
        fullName: 'PRECTOTCORR (MERRA-2 corrected precipitation)',
        metric: '7-day and 30-day rainfall accumulation',
        currentValue: t.rainfall7dMm === null ? '—' : `${t.rainfall7dMm}`,
        unit: 'mm',
        status: 'valid',
        lastPassAgo: stamp,
        resolution: t.provenance.resolution,
        badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
        _source: 'power',
      },
      {
        id: 'power_soil',
        name: 'NASA POWER · Soil wetness',
        fullName: 'GWETTOP / GWETROOT surface and root-zone wetness',
        metric: 'Root-zone soil wetness (fraction of saturation)',
        currentValue:
          t.soilMoistureRootPercent === null ? '—' : `${t.soilMoistureRootPercent}`,
        unit: '%',
        status: 'valid',
        lastPassAgo: stamp,
        resolution: t.provenance.resolution,
        badgeColor: 'bg-primary-fixed text-on-primary-fixed-variant',
        _source: 'power',
      },
      {
        id: 'power_temp',
        name: 'NASA POWER · Air temperature',
        fullName: 'T2M / T2M_MAX / T2M_MIN at 2 m',
        metric: 'Mean air temperature and thermal amplitude',
        currentValue: t.temperatureAvgC === null ? '—' : `${t.temperatureAvgC}`,
        unit: '°C',
        status: 'valid',
        lastPassAgo: stamp,
        resolution: t.provenance.resolution,
        badgeColor: 'bg-secondary-fixed text-on-secondary-fixed',
        _source: 'power',
      },
      {
        id: 'power_et0',
        name: 'NASA POWER · Evapotranspiration',
        fullName: 'EVPTRNS evapotranspiration energy flux',
        metric: 'Reference evapotranspiration (25-year normal)',
        currentValue: (() => {
          const current = new Date().getUTCMonth() + 1;
          const point = t.monthly.find((m) => m.month === current);
          return point?.et0Mm === null || point?.et0Mm === undefined ? '—' : `${point.et0Mm}`;
        })(),
        unit: 'mm/month',
        status: 'valid',
        lastPassAgo: stamp,
        resolution: t.provenance.resolution,
        badgeColor: 'bg-surface-container-high text-primary',
        _source: 'power',
      },
    ];
  });

  function setActivePlot(id: string) {
    activePlotId.value = id;
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_PLOT_KEY, id);
    telemetry.value = null;
    telemetryError.value = null;
    void loadTelemetry();
  }

  async function loadCrops() {
    loadingCrops.value = true;
    cropsError.value = null;
    try {
      const { crops: list } = await api.crops();
      crops.value = list;
    } catch (e) {
      cropsError.value = e instanceof ApiError ? e.message : 'Unable to load the crop catalogue';
    } finally {
      loadingCrops.value = false;
    }
  }

  async function loadPlots() {
    loadingPlots.value = true;
    plotsError.value = null;
    try {
      const { plots: list } = await api.plots();
      plots.value = list;
      if (list.length && !list.some((p) => p.id === activePlotId.value)) {
        activePlotId.value = list[0].id;
        if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_PLOT_KEY, list[0].id);
      }
    } catch (e) {
      plotsError.value = e instanceof ApiError ? e.message : 'Unable to load your plots';
    } finally {
      loadingPlots.value = false;
    }
  }

  async function loadTelemetry(force = false) {
    const plot = activePlot.value;
    if (!plot) {
      telemetry.value = null;
      return;
    }
    const key = `${plot.coordinates.lat.toFixed(3)},${plot.coordinates.lng.toFixed(3)}`;
    if (!force && telemetryCache.value[key]) {
      telemetry.value = telemetryCache.value[key];
      return;
    }
    loadingTelemetry.value = true;
    telemetryError.value = null;
    try {
      const { telemetry: data } = await api.telemetry(plot.coordinates.lat, plot.coordinates.lng, force);
      telemetryCache.value = { ...telemetryCache.value, [key]: data };
      telemetry.value = data;
    } catch (e) {
      telemetryError.value =
        e instanceof ApiError ? e.message : 'NASA POWER telemetry is currently unavailable';
      telemetry.value = null;
    } finally {
      loadingTelemetry.value = false;
    }
  }

  /** Load everything the signed-in user needs. */
  async function loadAll() {
    await Promise.all([loadCrops(), loadPlots()]);
    await loadTelemetry();
  }

  async function createPlot(payload: PlotInput) {
    saving.value = true;
    try {
      const { plot } = await api.createPlot(payload);
      plots.value = [...plots.value, plot];
      setActivePlot(plot.id);
      return plot;
    } finally {
      saving.value = false;
    }
  }

  async function updatePlot(id: string, payload: Partial<PlotInput>) {
    saving.value = true;
    try {
      const { plot } = await api.updatePlot(id, payload);
      plots.value = plots.value.map((p) => (p.id === id ? plot : p));
      if (plot.id === activePlotId.value) {
        telemetryCache.value = {};
        await loadTelemetry(true);
      }
      return plot;
    } finally {
      saving.value = false;
    }
  }

  async function deletePlot(id: string) {
    await api.deletePlot(id);
    plots.value = plots.value.filter((p) => p.id !== id);
    if (activePlotId.value === id) {
      activePlotId.value = plots.value[0]?.id || null;
      if (typeof window !== 'undefined') {
        if (activePlotId.value) localStorage.setItem(ACTIVE_PLOT_KEY, activePlotId.value);
        else localStorage.removeItem(ACTIVE_PLOT_KEY);
      }
      await loadTelemetry();
    }
  }

  function setPhaseCrop(scenarioId: string, phaseIndex: number, cropId: string) {
    const current = overrides.value[scenarioId] || [];
    const scenario = scenarios.value.find((s) => s.id === scenarioId);
    if (!scenario) return;
    const next = scenario.phases.map((phase, idx) =>
      idx === phaseIndex ? cropId : current[idx] || phase.crop.id,
    );
    overrides.value = { ...overrides.value, [scenarioId]: next };
  }

  function resetOverride(scenarioId: string) {
    const next = { ...overrides.value };
    delete next[scenarioId];
    overrides.value = next;
  }

  function calculateWeightedScore(scenario: RotationScenario) {
    const total =
      weights.value.waterSecurity +
      weights.value.fcfaMargin +
      weights.value.soilFertility +
      weights.value.foodSecurity;
    if (!total) return scenario.overallScore;
    return Math.round(
      (scenario.radarScores.waterSecurity * weights.value.waterSecurity +
        scenario.radarScores.fcfaMargin * weights.value.fcfaMargin +
        scenario.radarScores.soilFertility * weights.value.soilFertility +
        scenario.radarScores.foodDiversification * weights.value.foodSecurity) /
        total,
    );
  }

  function setWeights(next: Partial<ScoringWeights>) {
    weights.value = { ...weights.value, ...next };
  }

  function resetWeights() {
    weights.value = { waterSecurity: 35, fcfaMargin: 30, soilFertility: 20, foodSecurity: 15 };
  }

  /** Drop everything held for the previous session (used on sign-out). */
  function reset() {
    crops.value = [];
    plots.value = [];
    telemetry.value = null;
    telemetryCache.value = {};
    overrides.value = {};
    activePlotId.value = null;
    cropsError.value = null;
    plotsError.value = null;
    telemetryError.value = null;
    if (typeof window !== 'undefined') localStorage.removeItem(ACTIVE_PLOT_KEY);
  }

  return {
    crops,
    plots,
    overrides,
    telemetry,
    climate,
    activePlot,
    activePlotId,
    scenarios,
    recommendedScenario,
    satelliteSources,
    weights,
    loadingCrops,
    loadingPlots,
    loadingTelemetry,
    saving,
    cropsError,
    plotsError,
    telemetryError,
    loadAll,
    loadCrops,
    loadPlots,
    loadTelemetry,
    createPlot,
    updatePlot,
    deletePlot,
    setActivePlot,
    setPhaseCrop,
    resetOverride,
    calculateWeightedScore,
    setWeights,
    resetWeights,
    reset,
  };
});
