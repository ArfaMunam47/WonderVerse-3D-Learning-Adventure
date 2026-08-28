import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square, RotateCcw, Footprints, Sparkles } from 'lucide-react';
import { audioService } from '../../utils/audio';

interface CompactMovementClusterProps {
  onMove: (dir: { x: number; z: number }) => void;
  onReset: () => void;
  onStop: () => void;
  onAutoWalkNext?: () => void;
  isAutoWalking?: boolean;
  reducedMotion?: boolean;
}

export const CompactMovementCluster: React.FC<CompactMovementClusterProps> = ({
  onMove,
  onReset,
  onStop,
  onAutoWalkNext,
  isAutoWalking = false
}) => {
  const currentVector = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const animFrameId = useRef<number | null>(null);
  const [activeDirection, setActiveDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isStoppedFlash, setIsStoppedFlash] = useState<boolean>(false);

  // Movement physics dispatch loop
  useEffect(() => {
    const loop = () => {
      if (Math.abs(currentVector.current.x) > 0.02 || Math.abs(currentVector.current.z) > 0.02) {
        onMove(currentVector.current);
      }
      animFrameId.current = requestAnimationFrame(loop);
    };
    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [onMove]);

  // Button hold handlers for mouse / pointer / touch
  const handlePointerDownDirection = (dir: 'up' | 'down' | 'left' | 'right') => {
    audioService.playPop();
    setActiveDirection(dir);
    if (dir === 'up') currentVector.current = { x: 0, z: -1 };
    if (dir === 'down') currentVector.current = { x: 0, z: 1 };
    if (dir === 'left') currentVector.current = { x: -1, z: 0 };
    if (dir === 'right') currentVector.current = { x: 1, z: 0 };
  };

  const handlePointerUpDirection = () => {
    currentVector.current = { x: 0, z: 0 };
    setActiveDirection(null);
  };

  // Instant Stop Handler
  const handleInstantStop = () => {
    currentVector.current = { x: 0, z: 0 };
    setActiveDirection(null);
    onStop();
    audioService.playPop();
    setIsStoppedFlash(true);
    setTimeout(() => setIsStoppedFlash(false), 900);
  };

  return (
    <div
      id="toddler-friendly-movement-controls"
      className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20 flex items-center gap-3 pointer-events-auto select-none"
    >
      {/* 1. Big Tactile Stop Button */}
      <button
        type="button"
        id="character-instant-stop-btn"
        onClick={handleInstantStop}
        className={`h-14 md:h-16 px-4 md:px-5 rounded-3xl flex items-center justify-center gap-2 font-display font-black text-sm md:text-base border-3 shadow-xl cursor-pointer transition-all active:scale-95 ${
          isStoppedFlash
            ? 'bg-rose-600 text-white border-rose-300 scale-105 ring-4 ring-rose-400/50'
            : 'bg-[#FFFDF7]/95 hover:bg-rose-50 text-rose-700 border-rose-300 backdrop-blur-md'
        }`}
        title="Stop moving immediately"
        aria-label="Stop Character Movement"
      >
        <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
          <Square className="w-4 h-4 fill-white" />
        </div>
        <span className="hidden sm:inline">STOP</span>
      </button>

      {/* 2. Large, Soft, Clear 4-Way Directional Touch Pad */}
      <div className="bg-[#FFFDF7]/95 backdrop-blur-md p-2 rounded-3xl shadow-xl border-3 border-amber-300 flex items-center justify-center">
        <div className="relative w-32 h-32 md:w-36 md:h-36 flex items-center justify-center">
          {/* Top (Forward) */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('up')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm border-2 ${
              activeDirection === 'up'
                ? 'bg-emerald-600 text-white border-emerald-700 scale-105'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
            title="Walk Forward"
            aria-label="Move Forward"
          >
            <ArrowUp className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Bottom (Backward) */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('down')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm border-2 ${
              activeDirection === 'down'
                ? 'bg-emerald-600 text-white border-emerald-700 scale-105'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
            title="Walk Backward"
            aria-label="Move Backward"
          >
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Left */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('left')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm border-2 ${
              activeDirection === 'left'
                ? 'bg-emerald-600 text-white border-emerald-700 scale-105'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
            title="Walk Left"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Right */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('right')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-sm border-2 ${
              activeDirection === 'right'
                ? 'bg-emerald-600 text-white border-emerald-700 scale-105'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
            title="Walk Right"
            aria-label="Move Right"
          >
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Center Recenter Button */}
          <button
            type="button"
            onClick={() => {
              audioService.playSparkle();
              onReset();
            }}
            className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center justify-center cursor-pointer active:scale-90 transition-transform border-2 border-amber-400 z-10"
            title="Recenter Camera"
            aria-label="Recenter Explorer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
