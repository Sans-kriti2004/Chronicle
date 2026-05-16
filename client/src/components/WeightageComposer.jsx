import React from 'react';
import { totalWeightage } from '../lib/scoreEngine';

export default function WeightageComposer({ goals }) {
  const total = totalWeightage(goals);
  const color = total === 100 ? 'bg-progress' : total > 100 ? 'bg-warning' : 'bg-amberline';
  const message = total === 100 ? 'Ready for the editor.' : total > 100 ? 'The story is overweight.' : 'Keep composing until the arc reaches 100%.';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Weightage Composer</p>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
        <span className="text-2xl font-black">{total}%</span>
      </div>
      <div className="mt-4 h-3 rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${Math.min(total, 100)}%` }} />
      </div>
    </div>
  );
}
