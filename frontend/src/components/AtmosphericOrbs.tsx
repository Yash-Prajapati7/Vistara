import React from 'react';

/**
 * Atmospheric background orbs using Tailwind utility classes and pastel gradient tokens.
 * Mint, Peach, Lavender, Sky, Rose drifting softly in canvas backdrop.
 */
export const AtmosphericOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Mint orb top-right */}
      <div
        className="absolute rounded-full filter blur-[80px] opacity-45 dark:opacity-25 pointer-events-none animate-orb-drift w-[520px] h-[520px] -top-[120px] right-[5%]"
        style={{
          background: 'radial-gradient(circle, #a7e5d3 0%, rgba(167, 229, 211, 0) 70%)',
        }}
      />

      {/* Peach orb middle-center */}
      <div
        className="absolute rounded-full filter blur-[80px] opacity-40 dark:opacity-20 pointer-events-none animate-orb-drift w-[460px] h-[460px] top-[35%] left-[30%]"
        style={{
          background: 'radial-gradient(circle, #f4c5a8 0%, rgba(244, 197, 168, 0) 70%)',
          animationDelay: '-6s',
        }}
      />

      {/* Lavender & Sky orb bottom-left */}
      <div
        className="absolute rounded-full filter blur-[80px] opacity-35 dark:opacity-20 pointer-events-none animate-orb-drift w-[580px] h-[580px] -bottom-[140px] left-[10%]"
        style={{
          background: 'radial-gradient(circle, #c8b8e0 0%, rgba(200, 184, 224, 0) 65%)',
          animationDelay: '-12s',
        }}
      />

      {/* Subtle Rose orb top-left */}
      <div
        className="absolute rounded-full filter blur-[80px] opacity-30 dark:opacity-15 pointer-events-none animate-orb-drift w-[380px] h-[380px] top-[10%] -left-[60px]"
        style={{
          background: 'radial-gradient(circle, #e8b8c4 0%, rgba(232, 184, 196, 0) 70%)',
          animationDelay: '-3s',
        }}
      />
    </div>
  );
};
