import type {
  ClimateTelemetry,
  Crop,
  CropFamily,
  FarmPlot,
  RotationPhase,
  RotationScenario,
  ScoringWeights,
} from '@/types';
import { evaluateRotationScenario, extractScoringFeatures } from '@/services/scoringEngine';
import { findingText } from '@/i18n/findings';

type Lang = 'en' | 'fr';
type Tr = (en: string, fr: string) => string;

export interface ScenarioBuildContext {
  crops: Crop[];
  telemetry: ClimateTelemetry | null;
  plot: FarmPlot | null;
  weights: ScoringWeights;
  lang: Lang;
  tr: Tr;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

/**
 * Variable-cost share of gross revenue per family (inputs, labour, transport).
 * Documented assumption used to turn reference yields into a gross margin; it is
 * a planning coefficient, not a measurement.
 */
const COST_RATIO: Record<CropFamily, number> = {
  cereale: 0.42,
  legumineuse: 0.38,
  tubercule: 0.45,
  maraichage: 0.55,
  perenne: 0.4,
};

export interface SeasonSlot {
  index: number;
  startMonth: number; // 1-12
  endMonth: number; // 1-12 (inclusive, may wrap)
  rainMm: number | null; // climatological rainfall inside the window
}

const monthList = (start: number, end: number): number[] => {
  const out: number[] = [];
  let m = start;
  for (let i = 0; i < 12; i += 1) {
    out.push(m);
    if (m === end) break;
    m = m === 12 ? 1 : m + 1;
  }
  return out;
};

/** Wet-season windows derived from the 25-year POWER rainfall normal. */
export function deriveSeasons(telemetry: ClimateTelemetry | null): SeasonSlot[] {
  const monthly = telemetry?.monthly ?? [];
  const rainByMonth = new Map<number, number | null>();
  monthly.forEach((m) => rainByMonth.set(m.month, m.rainClimatologyMm));

  const isWet = (month: number) => {
    const v = rainByMonth.get(month);
    return v !== null && v !== undefined && v >= 100;
  };

  const groups: number[][] = [];
  let current: number[] = [];
  for (let m = 1; m <= 12; m += 1) {
    if (isWet(m)) {
      current.push(m);
    } else if (current.length) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);

  let slots: { start: number; end: number }[];
  if (groups.length >= 2) {
    slots = groups.slice(0, 2).map((g) => ({ start: g[0], end: g[g.length - 1] }));
  } else if (groups.length === 1) {
    const g = groups[0];
    if (g.length >= 6) {
      const mid = Math.ceil(g.length / 2);
      slots = [
        { start: g[0], end: g[mid - 1] },
        { start: g[mid], end: g[g.length - 1] },
      ];
    } else {
      slots = [{ start: g[0], end: g[g.length - 1] }, { start: 9, end: 11 }];
    }
  } else {
    // No month reaches 100 mm: unimodal or arid profile, keep two working windows.
    slots = [{ start: 6, end: 8 }, { start: 9, end: 11 }];
  }

  return slots.map((slot, idx) => {
    const months = monthList(slot.start, slot.end);
    const values = months.map((m) => rainByMonth.get(m) ?? null);
    const known = values.filter((v): v is number => v !== null);
    return {
      index: idx + 1,
      startMonth: slot.start,
      endMonth: slot.end,
      rainMm: known.length ? Math.round(known.reduce((a, b) => a + b, 0)) : null,
    };
  });
}

const cropName = (crop: Crop, lang: Lang) => (lang === 'fr' && crop.nameFr ? crop.nameFr : crop.name);

function pickCrop(crops: Crop[], family: CropFamily, exclude: string[] = []): Crop | null {
  const inFamily = crops.filter((c) => c.family === family && !exclude.includes(c.id));
  const pool = inFamily.length ? inFamily : crops;
  if (!pool.length) return null;
  return [...pool].sort((a, b) => a.cycleDays - b.cycleDays)[0];
}

function phaseLabel(slot: SeasonSlot, lang: Lang, ordinal: number): { name: string; period: string } {
  const months = lang === 'fr' ? MONTHS_FR : MONTHS_EN;
  const startLabel = months[slot.startMonth - 1];
  const endLabel = months[slot.endMonth - 1];
  const name =
    ordinal === 3
      ? lang === 'fr'
        ? 'Saison pérenne de transition'
        : 'Perennial transition season'
      : slot.index === 1
        ? lang === 'fr'
          ? 'Première saison des pluies'
          : 'First rainy season'
        : lang === 'fr'
          ? 'Grande saison des pluies'
          : 'Main rainy season';
  return { name, period: `${startLabel} – ${endLabel}` };
}

interface RotationPhaseDraft {
  crop: Crop;
  season: SeasonSlot;
  ordinal: number;
}

function buildPhases(
  drafts: RotationPhaseDraft[],
  ctx: ScenarioBuildContext,
  monoculture: boolean,
): { phases: RotationPhase[]; evaluation: ReturnType<typeof evaluateRotationScenario> } {
  const { lang, tr, telemetry } = ctx;
  const surface = ctx.plot?.surfaceHa ?? 1;

  const phaseInputs = drafts.map((d) => ({
    crop: d.crop,
    seasonIndex: d.ordinal,
    rainSupplyMm: d.season.rainMm,
  }));

  const features = extractScoringFeatures(phaseInputs, telemetry);
  const evaluation = evaluateRotationScenario({ features, weights: ctx.weights });

  const phases: RotationPhase[] = drafts.map((draft) => {
    const { crop } = draft;
    const rain = draft.season.rainMm;
    const adequacy =
      rain === null ? evaluation.radarScores.waterSecurity : Math.max(20, Math.min(100, Math.round((rain / crop.waterNeedMm) * 100)));

    // Reference potential discounted by water adequacy; monoculture repeats degrade yield.
    const waterFactor = Math.max(0.55, Math.min(1.05, adequacy / 100));
    const repetitionPenalty = monoculture && draft.ordinal > 1 ? 0.85 : 1;
    const plannedYieldKgHa = crop.yieldPotentialKgHa * waterFactor * repetitionPenalty;
    const revenue = plannedYieldKgHa * crop.marketPriceFcfaKg;
    const grossMargin = Math.round(revenue * (1 - COST_RATIO[crop.family]));

    const dateWindow = telemetry?.nextSeedingWindow;
    const windowNote =
      draft.ordinal === 1 && dateWindow
        ? tr(
            `Sow inside the ${dateWindow.start} → ${dateWindow.end} window (25-year POWER onset).`,
            `Semer dans la fenêtre ${dateWindow.start} → ${dateWindow.end} (installation calculée sur 25 ans POWER).`,
          )
        : tr(
            `Rain-fed water supply over ${draft.season.rainMm ?? '—'} mm of normal rainfall against ${crop.waterNeedMm} mm required.`,
            `Apport pluvial de ${draft.season.rainMm ?? '—'} mm de pluie normale pour ${crop.waterNeedMm} mm requis.`,
          );

    const rotationNote = monoculture
      ? tr(
          'Repeating the same family increases pest pressure and nutrient mining.',
          'La répétition de la même famille augmente la pression parasitaire et le minage des nutriments.',
        )
      : crop.nitrogenFixationKgHa > 0
        ? tr(
            `Fixes ${crop.nitrogenFixationKgHa} kg N/ha for the next crop.`,
            `Fixe ${crop.nitrogenFixationKgHa} kg N/ha pour la culture suivante.`,
          )
        : tr(
            `Exports ${Math.abs(crop.nitrogenFixationKgHa)} kg N/ha, to be compensated by the legume.`,
            `Exporte ${Math.abs(crop.nitrogenFixationKgHa)} kg N/ha, à compenser par la légumineuse.`,
          );

    const label = phaseLabel(draft.season, lang, draft.ordinal);

    return {
      seasonIndex: draft.ordinal,
      seasonName: label.name,
      seasonPeriod: label.period,
      crop,
      plannedYieldTonnesHa: Math.round((plannedYieldKgHa / 1000) * 10) / 10,
      grossMarginFcfaHa: grossMargin,
      waterAdequacyPercent: adequacy,
      nitrogenBalanceKgHa: crop.nitrogenFixationKgHa,
      diseaseBreakRisk: monoculture ? 'eleve' : evaluation.pestRiskLevel,
      notes: `${windowNote} ${rotationNote}`,
    } satisfies RotationPhase;
  });

  // Recompute the weight-specific score with the real plot surface for revenue.
  void surface;
  return { phases, evaluation };
}

function assemble(
  id: string,
  tag: 'A' | 'B' | 'C',
  drafts: RotationPhaseDraft[],
  ctx: ScenarioBuildContext,
  monoculture: boolean,
): RotationScenario {
  const { phases, evaluation } = buildPhases(drafts, ctx, monoculture);
  const surface = ctx.plot?.surfaceHa ?? 1;
  const netMarginFcfaHa = phases.reduce((sum, p) => sum + p.grossMarginFcfaHa, 0);

  return {
    id,
    tag,
    name: phases.map((p) => cropName(p.crop, ctx.lang)).join(' → '),
    subtitle: findingText(evaluation.agronomicRecommendation, ctx.lang),
    isRecommended: false,
    overallScore: evaluation.score,
    netMarginFcfaHa,
    totalIncomePlotFcfa: Math.round(netMarginFcfaHa * surface),
    nitrogenBalanceKgHa: evaluation.nitrogenBalanceKgHa,
    waterStressPercent: evaluation.waterStressRiskPercent,
    failureRiskPercent: evaluation.failureRiskPercent,
    phases,
    radarScores: evaluation.radarScores,
    scoreExplanation: {
      strengths: evaluation.strengths.map((f) => findingText(f, ctx.lang)),
      weaknesses: evaluation.weaknesses.map((f) => findingText(f, ctx.lang)),
      agronomicSummary: findingText(evaluation.agronomicRecommendation, ctx.lang),
    },
    _source: 'irad',
  };
}

/**
 * Builds the three rotation scenarios from the live crop catalogue and NASA
 * telemetry. Returns an empty list when there is no catalogue or no telemetry —
 * the UI then shows an explicit empty state instead of invented numbers.
 */
export type ScenarioOverrides = Record<string, string[]>;

export function buildScenarios(
  ctx: ScenarioBuildContext,
  overrides: ScenarioOverrides = {},
): RotationScenario[] {
  const { crops } = ctx;
  if (!crops.length || !ctx.telemetry) return [];

  /** Replace the catalogue default by the crop the user picked for that phase. */
  const applyOverrides = (id: string, drafts: RotationPhaseDraft[]): RotationPhaseDraft[] => {
    const picked = overrides[id];
    if (!picked?.length) return drafts;
    return drafts.map((draft, idx) => {
      const crop = crops.find((c) => c.id === picked[idx]);
      return crop ? { ...draft, crop } : draft;
    });
  };

  const seasons = deriveSeasons(ctx.telemetry);
  const [s1, s2] = seasons;
  const s3: SeasonSlot = {
    index: 3,
    startMonth: s2 ? s2.endMonth : 11,
    endMonth: s2 ? (s2.endMonth % 12) + 1 : 10,
    rainMm: null,
  };

  // Long-cycle crops get their own window: from the end of the main season forward.
  const perennialWindow: SeasonSlot = { ...s3, startMonth: s2 ? s2.startMonth : 11 };

  const cereal = pickCrop(crops, 'cereale');
  const legume = pickCrop(crops, 'legumineuse');
  const tuber = pickCrop(crops, 'tubercule');
  const horticulture = pickCrop(crops, 'maraichage');
  const cerealB = cereal ? pickCrop(crops, 'cereale', [cereal.id]) || cereal : null;

  const scenarios: RotationScenario[] = [];

  if (cereal && legume && tuber) {
    scenarios.push(
      assemble(
        'scenario_a',
        'A',
        applyOverrides('scenario_a', [
          { crop: cereal, season: s1, ordinal: 1 },
          { crop: legume, season: s2 || s1, ordinal: 2 },
          { crop: tuber, season: perennialWindow, ordinal: 3 },
        ]),
        ctx,
        false,
      ),
    );
  }

  if (legume && cereal && horticulture) {
    scenarios.push(
      assemble(
        'scenario_b',
        'B',
        applyOverrides('scenario_b', [
          { crop: legume, season: s1, ordinal: 1 },
          { crop: cereal, season: s2 || s1, ordinal: 2 },
          { crop: horticulture, season: s3, ordinal: 3 },
        ]),
        ctx,
        false,
      ),
    );
  }

  if (cereal && cerealB) {
    scenarios.push(
      assemble(
        'scenario_c',
        'C',
        applyOverrides('scenario_c', [
          { crop: cereal, season: s1, ordinal: 1 },
          { crop: cerealB, season: s2 || s1, ordinal: 2 },
          { crop: cereal, season: s3, ordinal: 3 },
        ]),
        ctx,
        true,
      ),
    );
  }

  if (!scenarios.length) return [];

  // Equal scores are broken by the higher net margin, so the flagged rotation is
  // never chosen by array order alone.
  const best = scenarios.reduce((a, b) => {
    if (b.overallScore !== a.overallScore) return b.overallScore > a.overallScore ? b : a;
    return b.netMarginFcfaHa > a.netMarginFcfaHa ? b : a;
  }, scenarios[0]);
  best.isRecommended = true;
  return scenarios;
}
