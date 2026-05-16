export function computeScore(uomType, target, actual, deadline = null) {
  switch (uomType) {
    case 'MIN':
      return target <= 0 ? 0 : Math.min((actual / target) * 100, 100);
    case 'MAX':
      if (actual === 0) return 100;
      return target <= 0 ? 0 : Math.min((target / actual) * 100, 100);
    case 'TIMELINE': {
      if (!deadline) return 0;
      const completionDate = new Date(actual);
      const deadlineDate = new Date(deadline);
      return completionDate <= deadlineDate ? 100 : 0;
    }
    case 'ZERO':
      return actual === 0 ? 100 : 0;
    default:
      return 0;
  }
}

export function totalWeightage(goals = []) {
  return goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
}

export function statusLabel(status) {
  return {
    DRAFT: 'In Draft',
    SUBMITTED: 'Awaiting Editor',
    APPROVED: 'Published',
    RETURNED: 'Sent Back for Revision'
  }[status] || status;
}
