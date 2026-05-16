import React from 'react';
import Icon from './Icon';

export default function ChapterCard({ goal }) {
  const latest = goal.achievements?.at(-1);
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-amberline">
            <Icon name="book" size={14} /> {goal.thrustArea}
          </div>
          <h3 className="mt-2 text-lg font-black">{goal.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{goal.description || 'No margin note yet.'}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-slate-100 px-3 py-1">{goal.weightage}%</span>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">{goal.uomType}</span>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-2 text-sm text-slate-600"><Icon name="target" /> Target {goal.target}</div>
        <div className="flex items-center gap-2 text-sm text-slate-600"><Icon name="clock" /> {goal.status?.replaceAll('_', ' ')}</div>
        <div className="text-sm font-bold text-ink">Plot score {Math.round(latest?.score || 0)}%</div>
      </div>
    </article>
  );
}
