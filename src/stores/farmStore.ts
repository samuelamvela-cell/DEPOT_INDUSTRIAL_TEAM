import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  MOCK_PLOT,
  MOCK_CROPS,
  MOCK_CLIMATE,
  MOCK_SCENARIOS,
  MOCK_USER,
  MOCK_SATELLITE_SOURCES,
} from '@/data/mockData';
import { FarmPlot, Crop, RotationScenario, ScoringWeights, UserProfile, SatelliteSource } from '@/types';

export const useFarmStore = defineStore('farm', () => {
  const activePlot = ref<FarmPlot>({ ...MOCK_PLOT });
  const crops = ref<Crop[]>([...MOCK_CROPS]);
  const climate = ref({ ...MOCK_CLIMATE });
  const scenarios = ref<RotationScenario[]>([...MOCK_SCENARIOS]);
  const satelliteSources = ref<SatelliteSource[]>([...MOCK_SATELLITE_SOURCES]);
  const user = ref<UserProfile>({ ...MOCK_USER });

  // Weights for decision comparator (sums to 100%)
  const weights = ref<ScoringWeights>({
    waterSecurity: 35,
    fcfaMargin: 30,
    soilFertility: 20,
    foodSecurity: 15,
  });

  const activeScenarioId = ref<string>('scenario_a');

  const activeScenario = computed(() => {
    return scenarios.value.find((s) => s.id === activeScenarioId.value) || scenarios.value[0];
  });

  const recommendedScenario = computed(() => {
    return scenarios.value.find((s) => s.isRecommended) || scenarios.value[0];
  });

  // Calculate dynamically weighted score for any scenario based on current sliders
  const calculateWeightedScore = (scenario: RotationScenario) => {
    const totalWeight =
      weights.value.waterSecurity +
      weights.value.fcfaMargin +
      weights.value.soilFertility +
      weights.value.foodSecurity;

    if (totalWeight === 0) return scenario.overallScore;

    const weighted =
      (scenario.radarScores.waterSecurity * weights.value.waterSecurity +
        scenario.radarScores.fcfaMargin * weights.value.fcfaMargin +
        scenario.radarScores.soilFertility * weights.value.soilFertility +
        scenario.radarScores.foodDiversification * weights.value.foodSecurity) /
      totalWeight;

    return Math.round(weighted);
  };

  const setWeights = (newWeights: Partial<ScoringWeights>) => {
    weights.value = { ...weights.value, ...newWeights };
  };

  const resetWeights = () => {
    weights.value = {
      waterSecurity: 35,
      fcfaMargin: 30,
      soilFertility: 20,
      foodSecurity: 15,
    };
  };

  const updatePlot = (updated: Partial<FarmPlot>) => {
    activePlot.value = { ...activePlot.value, ...updated };
  };

  return {
    activePlot,
    crops,
    climate,
    scenarios,
    satelliteSources,
    user,
    weights,
    activeScenarioId,
    activeScenario,
    recommendedScenario,
    calculateWeightedScore,
    setWeights,
    resetWeights,
    updatePlot,
  };
});
