import React from 'react';
import { WORLD_ZONES } from '../../data/worldZones';
import { WorldZoneId } from '../../types';
import { audioService } from '../../utils/audio';
import { X, Compass, Star, ArrowRight } from 'lucide-react';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zoneId: WorldZoneId) => void;
  activeZoneId: WorldZoneId | null;
}

export const WorldMapModal: React.FC<WorldMapModalProps> = ({
  isOpen,
  onClose,
  onSelectZone,
  activeZoneId
}) => {
  if (!isOpen) return null;

  const handleZoneClick = (zoneId: WorldZoneId) => {
    audioService.playPop();
    onSelectZone(zoneId);
    onClose();
  };

  return (
    <div
      id="world-map-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="world-map-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header in Warm Ivory */}
        <div className="p-4 md:p-5 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 id="world-map-title" className="text-lg md:text-xl font-display font-black text-stone-900">
                Wonder Meadow World Map
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Choose a place to visit!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-[#FFFDF7] hover:bg-amber-100/60 text-stone-700 flex items-center justify-center shadow-xs border border-amber-200 cursor-pointer"
            aria-label="Close World Map"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Destinations Grid */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#FAF8F5]">
          {WORLD_ZONES.map((zone) => {
            const isCurrent = activeZoneId === zone.id;
            const iconChar = zone.id === 'alphabet' ? '🌱' : zone.id === 'numbers' ? '🔢' : zone.id === 'fruits' ? '🍎' : zone.id === 'animals' ? '🐾' : zone.id === 'creative' ? '🎨' : zone.id === 'music' ? '🎵' : zone.id === 'stories' ? '📚' : '⭐';

            return (
              <button
                key={zone.id}
                id={`map-zone-btn-${zone.id}`}
                onClick={() => handleZoneClick(zone.id)}
                className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between shadow-xs relative group cursor-pointer ${
                  isCurrent
                    ? 'bg-[#FFFDF7] border-sky-500 ring-2 ring-sky-300 shadow-md'
                    : 'bg-[#FFFDF7] hover:bg-amber-50/50 border-amber-200/70 hover:border-sky-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-xs"
                      style={{ backgroundColor: zone.themeColor }}
                    >
                      {iconChar}
                    </div>

                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{zone.totalStars} Stars</span>
                    </span>
                  </div>

                  <h4 className="font-display font-black text-base text-stone-900 group-hover:text-sky-700">
                    {zone.name}
                  </h4>

                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                    {zone.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-sky-700">
                  <span>{zone.landmark}</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
