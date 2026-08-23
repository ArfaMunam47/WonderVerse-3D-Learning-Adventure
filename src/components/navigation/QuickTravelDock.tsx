import React, { useRef } from 'react';
import { WORLD_ZONES } from '../../data/worldZones';
import { audioService } from '../../utils/audio';
import { Sparkles, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface QuickTravelDockProps {
  onTravelToZone: (zoneId: string) => void;
  activeZoneId?: string | null;
  zoneVisits?: Record<string, number>;
}

export const QuickTravelDock: React.FC<QuickTravelDockProps> = ({
  onTravelToZone,
  activeZoneId,
  zoneVisits = {}
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="meadow-destination-dock"
      className="absolute bottom-3 right-3 left-30 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-3xl z-20 pointer-events-auto"
    >
      <div className="bg-[#FFFDF7]/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-lg border-2 border-amber-300/80 flex items-center gap-2 max-w-full">
        {/* Dock Section Label */}
        <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-amber-200 text-stone-700 font-display font-extrabold text-[11px] uppercase tracking-wider select-none shrink-0">
          <Compass className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
          <span>Destinations</span>
        </div>

        {/* Scroll Left Button for Desktop / Tablet */}
        <button
          type="button"
          onClick={() => {
            audioService.playPop();
            scroll('left');
          }}
          className="hidden md:flex w-6 h-6 rounded-full bg-amber-100/70 hover:bg-amber-200/80 text-stone-700 items-center justify-center cursor-pointer shrink-0 transition-colors"
          aria-label="Scroll destinations left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scrollable Destination Pills Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto py-0.5 px-0.5 no-scrollbar scroll-smooth whitespace-nowrap"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {WORLD_ZONES.map((zone) => {
            const isVisited = (zoneVisits[zone.id] || 0) > 0;
            const isCurrent = activeZoneId === zone.id;

            return (
              <button
                key={zone.id}
                id={`dock-zone-${zone.id}`}
                type="button"
                onClick={() => {
                  audioService.playSparkle();
                  onTravelToZone(zone.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer shrink-0 select-none shadow-2xs ${
                  isCurrent
                    ? 'bg-sky-600 text-white scale-105 shadow-xs'
                    : 'bg-amber-50/90 hover:bg-amber-100/90 text-stone-800 border border-amber-200/70 hover:border-amber-300'
                }`}
                title={`Visit ${zone.name}`}
              >
                <span className="text-base leading-none">{zone.icon}</span>
                <span className="font-display font-semibold">{zone.name}</span>
                {isVisited && (
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button for Desktop / Tablet */}
        <button
          type="button"
          onClick={() => {
            audioService.playPop();
            scroll('right');
          }}
          className="hidden md:flex w-6 h-6 rounded-full bg-amber-100/70 hover:bg-amber-200/80 text-stone-700 items-center justify-center cursor-pointer shrink-0 transition-colors"
          aria-label="Scroll destinations right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
