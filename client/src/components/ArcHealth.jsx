import React from 'react';

export default function ArcHealth({ arcHealth }) {
  const score = arcHealth?.score || 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-amberline">Arc Health</p>
          <p className="mt-1 text-sm text-slate-600">{arcHealth?.diagnosis || 'Your story is waiting for its first chapter.'}</p>
        </div>
        <div className="text-3xl font-black text-ink">{score}</div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-progress" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
