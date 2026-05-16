import React from 'react';

export default function Button({ className = '', variant = 'primary', ...props }) {
  const styles = {
    primary: 'bg-ink text-white hover:bg-slate-800',
    amber: 'bg-amberline text-ink hover:bg-amber-400',
    ghost: 'bg-transparent text-ink hover:bg-slate-100 border border-slate-200',
    danger: 'bg-warning text-ink hover:bg-red-300'
  };
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
