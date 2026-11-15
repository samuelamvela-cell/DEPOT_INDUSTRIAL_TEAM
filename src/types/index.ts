export type CropFamily = 'cereale' | 'legumineuse' | 'tubercule' | 'maraichage' | 'perenne';

export type WaterNeedLevel = 'faible' | 'modere' | 'eleve';

export type DataSource = 'power' | 'irad' | 'etl' | 'user';

export interface Crop {
  id: string;
  name: string;
  nameFr?: string;
  variety: string;
  family: CropFamily;
  cycleDays: number;
  waterNeedMm: number;
  waterNeedLevel: WaterNeedLevel;
  nitrogenFixationKgHa: number; // +45 for legumes, -60 for maize
  yieldPotentialKgHa: number;
  marketPriceFcfaKg: number;
  imageUrl: string;
  description: string;
  descriptionFr?: string;
  favorableSeasons: ('mars_juin' | 'sept_nov')[];
  stressTolerance: string;
  stressToleranceFr?: string;
  _source?: DataSource;
}

export interface PlotCoordinates {
  lat: number;
  lng: number;
  locality: string;
  region: string;
  zoneAgroEcologique: string;
}

export interface PreviousCrop {
  cropName: string;
  variety: string;
  harvestDate: string;
  yieldTonnesHa: number;
  residualNitrogenKgHa: number;
}

export interface FarmPlot {
  id: string;
  name: string;
  code: string;
  surfaceHa: number;
  soilType: string;
  soilPh: number;
  slopePercent: number;
  availableWaterCapacityMm: number;
  cooperativeName: string;
  advisorName: string;
  previousCrop: PreviousCrop;
  coordinates: PlotCoordinates;
  createdAt?: string;
  _source?: DataSource;
}

/* ---------------------------------------------------------------- telemetry */

export interface MonthlyRainfallPoint {
  month: number; // 1-12
  rainClimatologyMm: number | null; // 25-year POWER normal
  rainCurrentYearMm: number | null; // current campaign, null when not yet observed
  et0Mm: number | null; // reference evapotranspiration (POWER EVPTRNS -> mm)
}

export interface SeedingWindow {
  start: string; // ISO date
  end: string; // ISO date
  confidence: 'climatology';
  normalRainMm: number;
}

export interface DrySpell {
  warning: boolean;
  months: number[];
  thresholdMm: number;
}

export interface ClimateTelemetry {
  location: { lat: number; lng: number; elevationM: number | null };
  observed: { start: string; end: string; days: number };
  rainfall7dMm: number | null;
  rainfall7dDays: number;
  rainfall30dMm: number | null;
  rainfall30dDays: number;
  rainfallAnomalyPercent: number | null;
  temperatureAvgC: number | null;
  temperatureMaxC: number | null;
  temperatureMinC: number | null;
  humidityPercent: number | null;
  soilMoistureSurfacePercent: number | null;
  soilMoistureRootPercent: number | null;
  monthly: MonthlyRainfallPoint[];
  climatologyAnnualMm: number | null;
  currentYearMm: number | null;
  nextSeedingWindow: SeedingWindow | null;
  drySpell: DrySpell;
  provenance: {
    provider: string;
    apiVersion: string;
    sources: string[];
    parameters: string[];
    resolution: string;
    timeStandard: string;
    fetchedAt: string;
    url: string;
  };
  cache?: { hit: boolean; ageMinutes: number };
}

/* ------------------------------------------------------------------- engine */

export interface EngineFinding {
  code: string;
  params?: Record<string, number | string>;
}

export interface RotationPhase {
  seasonIndex: number;
  seasonName: string;
  seasonPeriod: string;
  crop: Crop;
  plannedYieldTonnesHa: number;
  grossMarginFcfaHa: number;
  waterAdequacyPercent: number;
  nitrogenBalanceKgHa: number;
  diseaseBreakRisk: 'faible' | 'modere' | 'eleve';
  notes: string;
}

export interface RotationScenario {
  id: string;
  tag: 'A' | 'B' | 'C';
  name: string;
  subtitle: string;
  isRecommended: boolean;
  overallScore: number;
  netMarginFcfaHa: number;
  totalIncomePlotFcfa: number;
  nitrogenBalanceKgHa: number;
  waterStressPercent: number;
  failureRiskPercent: number;
  phases: RotationPhase[];
  radarScores: {
    waterSecurity: number;
    climateMatch: number;
    soilFertility: number;
    foodDiversification: number;
    fcfaMargin: number;
  };
  scoreExplanation: {
    strengths: string[];
    weaknesses: string[];
    agronomicSummary: string;
  };
  _source?: DataSource;
}

export interface ScoringWeights {
  waterSecurity: number;
  fcfaMargin: number;
  soilFertility: number;
  foodSecurity: number;
}

export interface SatelliteSource {
  id: 'power_precip' | 'power_soil' | 'power_temp' | 'power_et0';
  name: string;
  fullName: string;
  metric: string;
  currentValue: string;
  unit: string;
  status: 'valid' | 'cached' | 'unavailable';
  lastPassAgo: string;
  resolution: string;
  badgeColor: string;
  _source: DataSource;
}

/* --------------------------------------------------------------------- auth */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  phone: string;
  language: 'en' | 'fr';
  currency: 'FCFA' | 'USD';
  surfaceUnit: 'ha' | 'piquet';
  region: string;
  createdAt: string;
  plotCount?: number;
}
