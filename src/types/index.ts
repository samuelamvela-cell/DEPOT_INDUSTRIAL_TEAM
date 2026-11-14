export type CropFamily = 'cereale' | 'legumineuse' | 'tubercule' | 'maraichage' | 'perenne';

export type WaterNeedLevel = 'faible' | 'modere' | 'eleve';
export type CycleDuration = 'court' | 'moyen' | 'long'; // <90j, 90-120j, >150j

export interface Crop {
  id: string;
  name: string;
  variety: string;
  family: CropFamily;
  cycleDays: number;
  waterNeedMm: number;
  waterNeedLevel: WaterNeedLevel;
  nitrogenFixationKgHa: number; // e.g. +45 kg N/ha for legumes, -60 for maize
  yieldPotentialKgHa: number;
  marketPriceFcfaKg: number;
  imageUrl: string;
  description: string;
  favorableSeasons: ('mars_juin' | 'sept_nov')[];
  stressTolerance: string;
}

export interface PlotCoordinates {
  lat: number;
  lng: number;
  locality: string;
  region: string;
  zoneAgroEcologique: string;
  polygon: [number, number][]; // SVG coordinates or GPS points
}

export interface FarmPlot {
  id: string;
  name: string;
  code: string;
  surfaceHa: number;
  soilType: string;
  soilPh: number;
  soilMoisturePercent: number;
  slopePercent: number;
  availableWaterCapacityMm: number;
  cooperativeName: string;
  advisorName: string;
  previousCrop: {
    cropName: string;
    variety: string;
    harvestDate: string;
    yieldTonnesHa: number;
    residualNitrogenKgHa: number;
  };
  coordinates: PlotCoordinates;
}

export interface SatelliteSource {
  id: 'gpm_imerg' | 'smap' | 'power' | 'modis';
  name: string;
  fullName: string;
  metric: string;
  currentValue: string;
  unit: string;
  status: 'valid' | 'syncing' | 'cached';
  lastPassAgo: string;
  resolution: string;
  badgeColor: string;
}

export interface ClimateTelemetry {
  rainfall7dMm: number;
  rainfall10yDiffPercent: number;
  temperatureAvgC: number;
  soilMoistureSmapPercent: number;
  soilMoistureRootPercent: number;
  ndviVigorIndex: number;
  nextSeedingWindow: string;
  drySpellWarning: boolean;
  drySpellDates: string;
  monthlyRainfallData: {
    month: string;
    rain20yAvgMm: number;
    rainCurrentYearMm: number;
    cropDemandMm: number;
  }[];
}

export interface RotationPhase {
  seasonIndex: number; // 1, 2, 3
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
  tag: 'A' | 'B' | 'C' | 'CUSTOM';
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
    waterSecurity: number;      // 0-100
    climateMatch: number;       // 0-100
    soilFertility: number;      // 0-100
    foodDiversification: number;// 0-100
    fcfaMargin: number;         // 0-100
  };
  scoreExplanation: {
    strengths: string[];
    weaknesses: string[];
    agronomicSummary: string;
  };
}

export interface ScoringWeights {
  waterSecurity: number; // e.g. 35%
  fcfaMargin: number;    // e.g. 30%
  soilFertility: number; // e.g. 20%
  foodSecurity: number;  // e.g. 15%
}

export interface UserProfile {
  name: string;
  role: string;
  matricule: string;
  organization: string;
  phone: string;
  whatsappActive: boolean;
  parcellesCount: number;
  sectorCovered: string;
  language: 'fr' | 'en';
  currency: 'FCFA' | 'USD';
  surfaceUnit: 'ha' | 'piquet';
  offlineStorage: {
    usedMb: number;
    totalMb: number;
    packLekieDownloaded: boolean;
  };
}
