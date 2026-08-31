import React from 'react';

interface MeadowEnvironmentBackdropProps {
  reducedMotion?: boolean;
}

/**
 * MeadowEnvironmentBackdrop - Picture-Book Children's World
 *
 * Palette:
 * - 60% Warm Cream / Soft Ivory (#FAF7F0, #FFFDF9)
 * - 25% Soft Sky Blue (#DCEEF8, #EBF5FB)
 * - 10% Gentle Meadow Sage Green (#6C9E78, #81B08C, #9BC2A5)
 * - 5% Warm Honey Highlights (#F6C844, #FDE68A)
 * - Natural warm wood brown & charcoal
 *
 * Cloud placement is specifically shifted away from the top-left to preserve
 * crystal-clear visibility and breathing room for the Wonder Meadow logo.
 */
export const MeadowEnvironmentBackdrop: React.FC<MeadowEnvironmentBackdropProps> = ({
  reducedMotion = false
}) => {
  return (
    <div
      id="meadow-environment-backdrop"
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. SKY GRADIENT: Soft Sky Blue fading into Warm Morning Ivory */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DCEEF8] via-[#EBF5FB] via-35% to-[#FAF7F0]" />

      {/* 2. SOFT MORNING DIRECTIONAL LIGHT (Natural illumination, not a giant cartoon sun) */}
      <div
        className="absolute -top-24 right-1/4 w-[480px] h-[480px] rounded-full opacity-50 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(254, 243, 199, 0.65) 0%, rgba(253, 230, 138, 0.2) 50%, transparent 75%)'
        }}
      />
      <div
        className="absolute top-12 left-1/3 w-[360px] h-[360px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(220, 238, 248, 0.75) 0%, transparent 70%)'
        }}
      />

      {/* 3. SOFT DRIFTING CLOUDS (Shifted away from header / logo) */}
      <div className="absolute inset-x-0 top-16 sm:top-14 h-28 opacity-80">
        {/* Cloud 1 - Mid Right (Clear of logo) */}
        <div
          className={`absolute right-[12%] top-0 transition-transform duration-1000 ${
            reducedMotion ? '' : 'animate-[cloudDriftReverse_42s_linear_infinite]'
          }`}
        >
          <div className="relative w-28 sm:w-36 h-9 sm:h-11 bg-white/80 rounded-full shadow-xs filter blur-[0.3px]">
            <div className="absolute -top-4 left-5 w-12 sm:w-14 h-12 sm:h-14 bg-white/85 rounded-full" />
            <div className="absolute -top-2 left-16 w-9 sm:w-11 h-9 sm:h-11 bg-white/80 rounded-full" />
          </div>
        </div>

        {/* Cloud 2 - Far Right Top */}
        <div
          className={`hidden md:block absolute right-[35%] top-4 transition-transform duration-1000 opacity-60 ${
            reducedMotion ? '' : 'animate-[cloudDriftSlow_48s_linear_infinite]'
          }`}
        >
          <div className="relative w-22 h-7 bg-white/65 rounded-full">
            <div className="absolute -top-3 left-3 w-8 h-8 bg-white/75 rounded-full" />
            <div className="absolute -top-2 left-10 w-7 h-7 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>

      {/* 4. DISTANT SOFT ROLLING HILLS (Layer 1 - Soft Pale Sage) */}
      <svg
        className="absolute bottom-16 sm:bottom-20 left-0 right-0 w-full h-32 sm:h-44 text-[#C2E0CC]/50"
        viewBox="0 0 1440 220"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        <path d="M0,130 C280,70 520,180 860,110 C1140,50 1340,140 1440,100 L1440,220 L0,220 Z" />
      </svg>

      {/* 5. MIDGROUND GENTLE HILLS (Layer 2 - Gentle Meadow Sage Green) */}
      <svg
        className="absolute bottom-6 sm:bottom-10 left-0 right-0 w-full h-28 sm:h-40 text-[#9FC6A8]/55"
        viewBox="0 0 1440 200"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        <path d="M0,90 C320,160 640,60 1020,130 C1260,180 1380,100 1440,110 L1440,200 L0,200 Z" />
      </svg>

      {/* 6. FOREGROUND MEADOW HILL (Layer 3 - Warm Gentle Meadow Grass) */}
      <svg
        className="absolute -bottom-1 left-0 right-0 w-full h-20 sm:h-28 text-[#81B08C]/65"
        viewBox="0 0 1440 160"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        <path d="M0,70 C420,20 880,110 1440,50 L1440,160 L0,160 Z" />
      </svg>

      {/* 7. GENTLE BUTTERFLIES & WILDFLOWER ACCENTS (Minimal, peaceful) */}
      {!reducedMotion && (
        <div className="absolute inset-x-0 bottom-4 sm:bottom-8 h-20 overflow-hidden pointer-events-none">
          {/* Soft Gold Butterfly */}
          <div className="absolute left-[15%] bottom-14 animate-[butterflyFlutter_16s_ease-in-out_infinite]">
            <div className="w-3.5 h-3.5 rounded-full bg-[#F6C844] shadow-xs opacity-90 flex items-center justify-center">
              <span className="text-[9px] select-none">🦋</span>
            </div>
          </div>

          {/* Soft Sky Blue Butterfly */}
          <div className="absolute right-[20%] bottom-20 animate-[butterflyFlutter_19s_ease-in-out_infinite_2s]">
            <div className="w-3 h-3 rounded-full bg-[#93C5FD] shadow-xs opacity-80 flex items-center justify-center">
              <span className="text-[8px] select-none">🦋</span>
            </div>
          </div>

          {/* Floating Dandelion Pollen */}
          <div className="absolute left-[24%] bottom-10 w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs animate-[pollenFloat_12s_ease-in-out_infinite]" />
          <div className="absolute left-[65%] bottom-12 w-2 h-2 rounded-full bg-[#FEF3C7]/90 shadow-xs animate-[pollenFloat_15s_ease-in-out_infinite_4s]" />
        </div>
      )}
    </div>
  );
};
