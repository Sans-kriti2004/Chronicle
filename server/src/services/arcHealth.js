import { weightedProgress } from './scoreEngine.js';

function diagnosis(score) {
  if (score >= 80) return 'Strong narrative - clear direction, good momentum';
  if (score >= 60) return 'Developing arc - some tension, needs resolution';
  if (score >= 40) return 'Flat arc - low ambition or stalled progress';
  return 'Lost plot - immediate attention needed';
}

function balanceScore(goals) {
  const thrustAreas = new Set(goals.map((goal) => goal.thrustArea).filter(Boolean));
  if (thrustAreas.size >= 3) return 25;
  if (thrustAreas.size === 2) return 16;
  if (thrustAreas.size === 1) return 5;
  return 0;
}

function ambitionScore(goals) {
  if (!goals.length) return 0;
  const ambitiousCount = goals.filter((goal) => Number(goal.target) >= 100).length;
  const ratio = ambitiousCount / goals.length;
  if (ratio === 0) return 5;
  if (ratio >= 0.35 && ratio <= 0.75) return 25;
  return 16;
}

function consistencyScore(sheet, cycle) {
  let score = 25;
  if (!sheet?.submittedAt) score -= 10;
  const openQuarterCount = ['q1Open', 'q2Open', 'q3Open', 'q4Open'].filter((key) => cycle?.[key]).length;
  const checkedQuarterCount = new Set((sheet?.checkIns || []).map((checkIn) => checkIn.quarter)).size;
  if (openQuarterCount > checkedQuarterCount) score -= (openQuarterCount - checkedQuarterCount) * 4;
  return Math.max(score, 0);
}

export function computeArcHealth(sheet, cycle = null, quarter = null) {
  const goals = sheet?.goals || [];
  const balance = balanceScore(goals);
  const ambition = ambitionScore(goals);
  const progress = Math.round(weightedProgress(goals, quarter) * 0.25);
  const consistency = consistencyScore(sheet, cycle);
  const score = Math.max(0, Math.min(balance + ambition + progress + consistency, 100));

  return {
    score,
    diagnosis: diagnosis(score),
    parts: { balance, ambition, progress, consistency }
  };
}
