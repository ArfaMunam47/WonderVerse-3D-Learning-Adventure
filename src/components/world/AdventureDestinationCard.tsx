import React from 'react';
import { WorldZoneId } from '../../types';
import { WORLD_ZONES } from '../../data/worldZones';
import { audioService } from '../../utils/audio';
import { Compass, Sparkles, ArrowRight, MapPin } from 'lucide-react';

interface AdventureDestinationCardProps {
  destinationZoneId: WorldZoneId | null;
  onExploreZone: (zoneId: WorldZoneId) => void;
  onOpenMap: () => void;
}

export const AdventureDestinationCard: React.FC<AdventureDestinationCardProps> = ({
  destinationZoneId,
  onExploreZone,
  onOpenMap
}) => {
  // Default to alphabet if no zone selected
  const activeZone = WORLD_ZONES.find(z => z.id === destinationZoneId) || WORLD_ZONES[0];

  return (
    <div
      id="adventure-destination-card"
      className="absolute bottom-3 right-3 md:bottom-5 md:right-5 z-20 pointer-events-auto select-none max-w-[280px] sm:max-w-xs"
    >
      <div className="bg-[#FFFDF7]/95 backdrop-blur-md p-3 sm:p-3.5 rounded-3xl border-2 border-amber-300 shadow-xl flex flex-col gap-2">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-800 font-display font-black text-[11px] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-sky-600 animate-spin-slow" />
            <span>Current Adventure</span>
          </div>

          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onOpenMap();
            }}
            className="text-[11px] font-bold text-sky-700 hover:text-sky-800 hover:underline cursor-pointer flex items-center gap-0.5"
            title="Change destination"
          >
            <MapPin className="w-3 h-3 text-sky-600" />
            <span>Change</span>
          </button>
        </div>

        {/* Zone Identity Preview */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0"
            style={{ backgroundColor: `${activeZone.themeColor}25` }}
          >
            <span>{activeZone.icon}</span>
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-black text-sm sm:text-base text-stone-800 truncate leading-tight">
              {activeZone.name}
            </h4>
            <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
              {activeZone.landmark}
            </p>
          </div>
        </div>

        {/* Action Button: Explore Adventure */}
        <button
          type="button"
          id="btn-explore-destination"
          onClick={() => {
            audioService.playSparkle();
            onExploreZone(activeZone.id);
          }}
          className="w-full h-9 sm:h-10 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-display font-black text-xs sm:text-sm shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Explore Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
