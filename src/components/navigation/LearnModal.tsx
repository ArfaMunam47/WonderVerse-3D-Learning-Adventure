import React from 'react';
import { WORLD_ZONES } from '../../data/worldZones';
import { WorldZoneId } from '../../types';
import { audioService } from '../../utils/audio';
import { X, BookOpen, Star, ArrowRight, Sparkles } from 'lucide-react';

interface LearnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectZone: (zoneId: WorldZoneId) => void;
  activeZoneId: WorldZoneId | null;
  zoneVisits?: Record<string, number>;
}

export const LearnModal: React.FC<LearnModalProps> = ({
  isOpen,
  onClose,
  onSelectZone,
  activeZoneId,
  zoneVisits = {}
}) => {
  if (!isOpen) return null;

  const handleStartActivity = (zoneId: WorldZoneId) => {
    audioService.playSparkle();
    onSelectZone(zoneId);
    onClose();
  };

  return (
    <div
      id="learn-adventures-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-stone-800/40 backdrop-blur-xs animate-in fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header in Soft Warm Amber */}
        <div className="p-4 md:p-5 bg-amber-50/90 border-b border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 id="learn-modal-title" className="text-lg md:text-xl font-display font-black text-stone-800">
                Learning Adventures
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Choose an adventure to learn, play, and discover!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white hover:bg-amber-100/60 text-stone-700 flex items-center justify-center shadow-xs border border-amber-200 cursor-pointer active:scale-95 transition-all"
            aria-label="Close Learning Adventures"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Adventures Grid */}
        <div className="p-4 md:p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 bg-[#FAF8F5]">
          {WORLD_ZONES.map((zone) => {
            const isCurrent = activeZoneId === zone.id;
            const visits = zoneVisits[zone.id] || 0;

            return (
              <button
                key={zone.id}
                id={`learn-activity-btn-${zone.id}`}
                onClick={() => handleStartActivity(zone.id)}
                className={`p-4 rounded-3xl border-2 text-left transition-all active:scale-95 flex flex-col justify-between shadow-xs relative group cursor-pointer bg-white ${
                  isCurrent
                    ? 'border-sky-500 ring-2 ring-sky-300 shadow-md'
                    : 'border-amber-200/80 hover:border-sky-400 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-xs"
                      style={{ backgroundColor: `${zone.themeColor}20` }}
                    >
                      <span>{zone.icon}</span>
                    </div>

                    {visits > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Played</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-black text-base text-stone-800 group-hover:text-sky-700 leading-snug">
                    {zone.name}
                  </h4>

                  <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                    {zone.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs font-bold text-sky-700">
                  <span className="text-[11px] text-stone-500 font-medium">Earn {zone.totalStars} Stars</span>
                  <span className="flex items-center gap-1 font-display font-bold">
                    <span>Play</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
