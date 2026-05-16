export const MAX_GOALS_PER_SHEET = 8;
export const MIN_WEIGHTAGE = 10;

export function validateGoalPayload(payload, { partial = false } = {}) {
  const errors = [];
  const required = ['thrustArea', 'title', 'uomType', 'target', 'weightage'];

  if (!partial) {
    required.forEach((field) => {
      if (payload[field] === undefined || payload[field] === '') errors.push(`${field} is required`);
    });
  }

  if (payload.weightage !== undefined && Number(payload.weightage) < MIN_WEIGHTAGE) {
    errors.push(`Each chapter needs at least ${MIN_WEIGHTAGE}% weightage`);
  }

  if (payload.uomType && !['MIN', 'MAX', 'TIMELINE', 'ZERO'].includes(payload.uomType)) {
    errors.push('Unknown unit of measure');
  }

  if (errors.length) {
    const error = new Error(errors.join(', '));
    error.status = 400;
    throw error;
  }
}

export function validateSheetWeightage(goals) {
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  if (total !== 100) {
    const error = new Error('Your Chronicle must reach exactly 100% weightage before review');
    error.status = 400;
    throw error;
  }
}

export function ensureGoalLimit(goals) {
  if (goals.length >= MAX_GOALS_PER_SHEET) {
    const error = new Error('A Chronicle can contain at most 8 chapters');
    error.status = 400;
    throw error;
  }
}

export function ensureDraftSheet(sheet) {
  if (!sheet || !['DRAFT', 'RETURNED'].includes(sheet.status)) {
    const error = new Error('Published or awaiting-review Chronicles cannot be edited here');
    error.status = 403;
    throw error;
  }
}

export function ensureQuarterWindow(cycle, quarter) {
  const key = `${quarter.toLowerCase()}Open`;
  if (!cycle?.[key]) {
    const error = new Error(`${quarter} plot updates are not open yet`);
    error.status = 403;
    throw error;
  }
}
