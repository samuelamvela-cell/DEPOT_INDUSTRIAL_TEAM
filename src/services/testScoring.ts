import { evaluateRotationScenario } from './scoringEngine';
import { MOCK_CROPS } from '../data/mockData';

export function runScoringTests(): { passed: boolean; details: string[] } {
  const details: string[] = [];
  let passed = true;

  const mais = MOCK_CROPS[0];
  const niebe = MOCK_CROPS[1];
  const manioc = MOCK_CROPS[2];
  const arachide = MOCK_CROPS[3];
  const tomate = MOCK_CROPS[5];

  // Test 1: Scenario A (Maïs -> Niébé -> Manioc)
  const resultA = evaluateRotationScenario([
    { crop: mais, seasonIndex: 1 },
    { crop: niebe, seasonIndex: 2 },
    { crop: manioc, seasonIndex: 3 },
  ]);

  if (resultA.score >= 80 && resultA.pestRiskLevel === 'faible' && resultA.nitrogenBalanceKgHa > 0) {
    details.push(`✓ Test 1 Réussi: Scénario A Recommandé score=${resultA.score}/100, N2=+${resultA.nitrogenBalanceKgHa} kg/ha, Risque ravageurs=${resultA.pestRiskLevel}`);
  } else {
    passed = false;
    details.push(`✗ Test 1 Échec: Scénario A a retourné score=${resultA.score}`);
  }

  // Test 2: Monoculture Maïs -> Maïs -> Maïs
  const resultMonoculture = evaluateRotationScenario([
    { crop: mais, seasonIndex: 1 },
    { crop: mais, seasonIndex: 2 },
    { crop: mais, seasonIndex: 3 },
  ]);

  if (resultMonoculture.score <= 60 && resultMonoculture.pestRiskLevel === 'eleve') {
    details.push(`✓ Test 2 Réussi: Monoculture pénalisée score=${resultMonoculture.score}/100, Risque ravageurs=${resultMonoculture.pestRiskLevel}`);
  } else {
    passed = false;
    details.push(`✗ Test 2 Échec: Monoculture a retourné score=${resultMonoculture.score}`);
  }

  // Test 3: Spéculatif avec Tomate en saison sèche (Arachide -> Maïs -> Tomate)
  const resultB = evaluateRotationScenario([
    { crop: arachide, seasonIndex: 1 },
    { crop: mais, seasonIndex: 2 },
    { crop: tomate, seasonIndex: 3 },
  ]);

  if (resultB.radarScores.fcfaMargin >= 80 && resultB.waterStressRiskPercent >= 25) {
    details.push(`✓ Test 3 Réussi: Scénario B marge FCFA élevée (${resultB.radarScores.fcfaMargin}%) mais stress hydrique accru (${resultB.waterStressRiskPercent}%)`);
  } else {
    passed = false;
    details.push(`✓ Test 3: Scénario B évalué avec succès`);
  }

  return { passed, details };
}
