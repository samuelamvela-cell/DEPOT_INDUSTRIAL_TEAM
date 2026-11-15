import type { ClimateTelemetry, Crop, EngineFinding, ScoringWeights } from '@/types';

/**
 * Feature extraction layer — normalises the rotation plus the live NASA POWER
 * telemetry into engine-ready features, so the scoring rules never touch raw
 * API payloads directly.
 */
export interface ScoringFeatures {
  nitrogenFixationSum: number;
  hasLegume: boolean;
  hasCereal: boolean;
  hasTubercule: boolean;
  hasMaraichage: boolean;
  hasMonoculture: boolean;
  waterNeedAverage: number;
  waterNeedTotalMm: number;
  rainSupplyMm: number | null;
  soilMoisturePercent: number | null;
  rainfallAnomalyPercent: number | null;
  drySpellWarning: boolean;
}

export interface PhaseLike {
  crop: Crop;
  seasonIndex: number;
  rainSupplyMm?: number | null;
}

export function extractScoringFeatures(
  phases: PhaseLike[],
  telemetry?: ClimateTelemetry | null,
): ScoringFeatures {
  const families = phases.map((p) => p.crop.family);
  const hasMonoculture = families.some((fam, idx) => idx > 0 && fam === families[idx - 1]);
  const waterNeeds = phases.map((p) => p.crop.waterNeedMm);
  const rainSupplies = phases
    .map((p) => p.rainSupplyMm)
    .filter((v): v is number => typeof v === 'number' && isFinite(v));

  return {
    nitrogenFixationSum: phases.reduce((acc, p) => acc + p.crop.nitrogenFixationKgHa, 0),
    hasLegume: families.includes('legumineuse'),
    hasCereal: families.includes('cereale'),
    hasTubercule: families.includes('tubercule'),
    hasMaraichage: families.includes('maraichage'),
    hasMonoculture,
    waterNeedAverage: waterNeeds.length
      ? waterNeeds.reduce((a, b) => a + b, 0) / waterNeeds.length
      : 0,
    waterNeedTotalMm: waterNeeds.reduce((a, b) => a + b, 0),
    rainSupplyMm: rainSupplies.length ? rainSupplies.reduce((a, b) => a + b, 0) : null,
    soilMoisturePercent: telemetry?.soilMoistureSurfacePercent ?? null,
    rainfallAnomalyPercent: telemetry?.rainfallAnomalyPercent ?? null,
    drySpellWarning: Boolean(telemetry?.drySpell?.warning),
  };
}

export interface ScoringEngineInput {
  features: ScoringFeatures;
  weights: ScoringWeights;
}

export interface ScenarioEvaluationResult {
  score: number;
  nitrogenBalanceKgHa: number;
  waterStressRiskPercent: number;
  failureRiskPercent: number;
  pestRiskLevel: 'faible' | 'modere' | 'eleve';
  radarScores: {
    waterSecurity: number;
    climateMatch: number;
    soilFertility: number;
    foodDiversification: number;
    fcfaMargin: number;
  };
  strengths: EngineFinding[];
  weaknesses: EngineFinding[];
  agronomicRecommendation: EngineFinding;
}

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

/**
 * Pure agronomic scoring engine based on IRAD (Cameroon) rotation rules and the
 * NASA POWER water balance. Every input is measured or published reference data;
 * the rules themselves are agronomic heuristics and are returned as codes so the
 * UI can present them in the active language.
 */
export function evaluateRotationScenario(input: ScoringEngineInput): ScenarioEvaluationResult {
  const { features, weights } = input;

  if (!features || features.waterNeedTotalMm === 0) {
    return {
      score: 0,
      nitrogenBalanceKgHa: 0,
      waterStressRiskPercent: 100,
      failureRiskPercent: 100,
      pestRiskLevel: 'eleve',
      radarScores: { waterSecurity: 0, climateMatch: 0, soilFertility: 0, foodDiversification: 0, fcfaMargin: 0 },
      strengths: [],
      weaknesses: [{ code: 'empty.phases' }],
      agronomicRecommendation: { code: 'recommend.empty' },
    };
  }

  const strengths: EngineFinding[] = [];
  const weaknesses: EngineFinding[] = [];

  const { hasLegume, hasCereal, hasTubercule, hasMaraichage, hasMonoculture, nitrogenFixationSum } = features;

  // 1. Nitrogen balance: crop offtake + symbiotic fixation + residue credit
  const organicBonus = hasLegume ? 70 : 0;
  const nitrogenBalance = hasMonoculture ? nitrogenFixationSum : nitrogenFixationSum + organicBonus;

  // 2. Soil fertility
  let soilFertility = 55 + Math.round(nitrogenBalance * 0.6);
  if (hasLegume) {
    soilFertility += 15;
    strengths.push({ code: 'soil.legume' });
  }
  if (hasMonoculture) {
    soilFertility = Math.min(soilFertility, 20);
    weaknesses.push({ code: 'soil.monoculture' });
  }
  soilFertility = clamp(soilFertility, 10, 98);

  // 3. Pest / disease break
  let pestRiskLevel: 'faible' | 'modere' | 'eleve' = 'modere';
  if (hasMonoculture) {
    pestRiskLevel = 'eleve';
    weaknesses.push({ code: 'pest.monoculture' });
  } else if (hasCereal && hasLegume) {
    pestRiskLevel = 'faible';
    strengths.push({ code: 'pest.break' });
  }

  // 4. Water security: measured rain supply versus the rotation's requirement,
  //    adjusted by the current soil moisture and rainfall anomaly from POWER.
  let waterSecurity: number;
  if (features.rainSupplyMm !== null) {
    const ratio = features.rainSupplyMm / Math.max(1, features.waterNeedTotalMm);
    waterSecurity = clamp(Math.round(ratio * 100));
  } else {
    waterSecurity = 55;
  }

  if (hasMaraichage) {
    waterSecurity = clamp(waterSecurity - 12);
    weaknesses.push({ code: 'water.horticulture' });
  }
  if (features.soilMoisturePercent !== null) {
    // Surface wetness above 40% of field capacity means the seedbed is workable.
    waterSecurity = clamp(waterSecurity + Math.round((features.soilMoisturePercent - 40) * 0.25));
  }
  if (features.rainfallAnomalyPercent !== null && features.rainfallAnomalyPercent < -25) {
    waterSecurity = clamp(waterSecurity - 10);
    weaknesses.push({ code: 'water.dry_anomaly', params: { percent: Math.abs(features.rainfallAnomalyPercent) } });
  } else if (features.rainfallAnomalyPercent !== null && features.rainfallAnomalyPercent > 20) {
    strengths.push({ code: 'water.wet_anomaly', params: { percent: features.rainfallAnomalyPercent } });
  }
  if (features.drySpellWarning) {
    weaknesses.push({ code: 'water.dry_spell' });
  }
  if (hasTubercule && hasLegume) {
    waterSecurity = clamp(Math.max(waterSecurity, 70));
    strengths.push({ code: 'water.deep_root' });
  }
  if (hasMonoculture) {
    waterSecurity = clamp(waterSecurity - 8);
  }

  const climateMatch = clamp(Math.round(waterSecurity * 0.95 + (hasLegume ? 3 : 0)));

  // 5. Household food diversification
  let foodDiversification = 70;
  if (hasCereal && hasLegume && hasTubercule) {
    foodDiversification = 85;
    strengths.push({ code: 'food.complete' });
  } else if (hasMonoculture) {
    foodDiversification = 20;
    weaknesses.push({ code: 'food.monoculture' });
  }

  // 6. Market value index (reference prices in the crop catalogue)
  let fcfaMargin = 70;
  if (hasMaraichage) {
    fcfaMargin = 95;
    strengths.push({ code: 'margin.horticulture' });
  } else if (hasCereal && hasLegume && hasTubercule) {
    fcfaMargin = 80;
    strengths.push({ code: 'margin.balanced' });
  } else if (hasMonoculture) {
    fcfaMargin = 55;
    weaknesses.push({ code: 'margin.monoculture' });
  }

  // 7. Weighted aggregate
  const totalWeight =
    weights.waterSecurity + weights.fcfaMargin + weights.soilFertility + weights.foodSecurity || 1;
  const score = Math.round(
    (waterSecurity * weights.waterSecurity +
      fcfaMargin * weights.fcfaMargin +
      soilFertility * weights.soilFertility +
      foodDiversification * weights.foodSecurity) /
      totalWeight,
  );

  const waterStressRiskPercent = clamp(100 - waterSecurity);
  const failureRiskPercent = clamp(Math.round((100 - score) * 0.85), 5, 85);

  let agronomicRecommendation: EngineFinding;
  if (score >= 80) agronomicRecommendation = { code: 'recommend.strong' };
  else if (score >= 65) agronomicRecommendation = { code: 'recommend.speculative' };
  else agronomicRecommendation = { code: 'recommend.avoid' };

  return {
    score,
    nitrogenBalanceKgHa: nitrogenBalance,
    waterStressRiskPercent,
    failureRiskPercent,
    pestRiskLevel,
    radarScores: { waterSecurity, climateMatch, soilFertility, foodDiversification, fcfaMargin },
    strengths,
    weaknesses,
    agronomicRecommendation,
  };
}
