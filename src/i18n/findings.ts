import type { EngineFinding } from '@/types';

type Lang = 'en' | 'fr';

const TEXT: Record<string, { en: (p: any) => string; fr: (p: any) => string }> = {
  'empty.phases': {
    en: () => 'No crop has been entered in this rotation yet.',
    fr: () => 'Aucune culture renseignée dans ce scénario.',
  },
  'soil.legume': {
    en: () => 'Symbiotic nitrogen fixed by the legume (free fertiliser)',
    fr: () => 'Régénération azotée naturelle par légumineuse (+N symbiotique)',
  },
  'soil.monoculture': {
    en: () => 'Same family two seasons in a row: severe nutrient depletion',
    fr: () => 'Succession consécutive de même famille : épuisement minéral sévère',
  },
  'pest.break': {
    en: () => 'Effective biological break of the stem-borer cycle',
    fr: () => 'Rupture biologique efficace du cycle du foreur de tige',
  },
  'pest.monoculture': {
    en: () => 'Repeated hosts multiply borers and armyworm pressure',
    fr: () => 'Hôtes répétés : multiplication des foreurs et de la chenille légionnaire',
  },
  'water.horticulture': {
    en: () => 'High water deficit risk for open-field horticulture in the dry season',
    fr: () => 'Risque élevé de déficit hydrique en saison sèche maraîchère',
  },
  'water.dry_anomaly': {
    en: (p) => `Last-30-day rainfall is ${p?.percent ?? 0}% below the 25-year normal`,
    fr: (p) => `Les pluies des 30 derniers jours sont ${p?.percent ?? 0}% sous la normale 25 ans`,
  },
  'water.wet_anomaly': {
    en: (p) => `Last-30-day rainfall is ${p?.percent ?? 0}% above the 25-year normal`,
    fr: (p) => `Les pluies des 30 derniers jours sont ${p?.percent ?? 0}% au-dessus de la normale 25 ans`,
  },
  'water.dry_spell': {
    en: () => 'The climatological dry spell falls inside this rotation window',
    fr: () => 'La pause sèche climatologique tombe dans cette fenêtre de rotation',
  },
  'water.deep_root': {
    en: () => 'Deep-rooted cassava buffers the dry spell for the whole rotation',
    fr: () => 'Le manioc à enracinement profond amortit la pause sèche sur toute la rotation',
  },
  'food.complete': {
    en: () => 'Complete food basket: cereal, plant protein and a storage tuber',
    fr: () => 'Filet vivrier complet : céréale, protéine végétale et tubercule de garde',
  },
  'food.monoculture': {
    en: () => 'Cereal monoculture with no household food diversification',
    fr: () => 'Monoculture céréalière sans diversification vivrière',
  },
  'margin.horticulture': {
    en: () => 'Highest revenue potential on the Yaoundé and Obala markets',
    fr: () => 'Potentiel financier maximum sur les marchés de Yaoundé et Obala',
  },
  'margin.balanced': {
    en: () => 'Regular, secured net margin across three complementary markets',
    fr: () => 'Marge nette régulière et sécurisée sur trois marchés complémentaires',
  },
  'margin.monoculture': {
    en: () => 'Rising synthetic fertiliser costs with falling yields',
    fr: () => 'Surcoûts croissants en fertilisants de synthèse avec rendements en baisse',
  },
  'recommend.strong': {
    en: () => 'Strongly recommended: the best water/soil trade-off for this plot.',
    fr: () => 'Scénario fortement recommandé : meilleur compromis eau-sol pour cette parcelle.',
  },
  'recommend.speculative': {
    en: () => 'Speculative: attractive returns, but only with secured irrigation.',
    fr: () => 'Scénario spéculatif : gains attractifs, sous réserve d’irrigation maîtrisée.',
  },
  'recommend.avoid': {
    en: () => 'Discouraged: high failure risk and soil degradation.',
    fr: () => 'Scénario déconseillé : risque élevé d’échec et de dégradation du sol.',
  },
  'recommend.empty': {
    en: () => 'Add at least two crops in succession to evaluate the rotation.',
    fr: () => 'Ajoutez au moins deux cultures en succession pour évaluer la rotation.',
  },
};

export function findingText(finding: EngineFinding | null | undefined, lang: Lang): string {
  if (!finding) return '';
  const entry = TEXT[finding.code];
  if (!entry) return finding.code;
  return entry[lang](finding.params || {});
}

