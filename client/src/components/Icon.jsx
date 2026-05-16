import React from 'react';

const paths = {
  book: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Zm2.5 0H18M6.5 18H20',
  logout: 'M10 17l5-5-5-5M15 12H3M21 3v18',
  newspaper: 'M4 4h14v16H4zM18 8h2v12h-2M7 8h8M7 12h8M7 16h5',
  pen: 'M4 20l4-1 11-11-3-3L5 16l-1 4ZM14 5l3 3',
  plus: 'M12 5v14M5 12h14',
  send: 'M3 11l18-8-8 18-2-7-8-3Zm8 3 10-11',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-3a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v5l4 2',
  check: 'M20 6 9 17l-5-5',
  return: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
  note: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
  refresh: 'M20 12a8 8 0 0 1-14 5M4 12a8 8 0 0 1 14-5M18 3v4h-4M6 21v-4h4',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14'
};

export default function Icon({ name, size = 16, className = '' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
