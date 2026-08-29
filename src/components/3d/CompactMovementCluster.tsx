import React, { useRef, useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Square } from 'lucide-react';
import { audioService } from '../../utils/audio';

interface CompactMovementClusterProps {
  onMove: (dir: { x: number; z: number }) => void;
  onStop: () => void;
  onReset?: () => void;
  reducedMotion?: boolean;
}

export const CompactMovementCluster: React.FC<CompactMovementClusterProps> = ({
  onMove,
  onStop,
  reducedMotion = false
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

  // Pointer/Touch hold handlers for directions
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

  // Instant Stop / Pause Handler (Square Center Button)
  const handleInstantStop = () => {
    currentVector.current = { x: 0, z: 0 };
    setActiveDirection(null);
    onStop();
    audioService.playPop();
    setIsStoppedFlash(true);
    setTimeout(() => setIsStoppedFlash(false), 500);
  };

  return (
    <div
      id="compact-game-controller"
      className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-20 pointer-events-auto select-none"
    >
      {/* Unified Compact Directional D-Pad with Center Square Stop */}
      <div className="relative w-[116px] h-[116px] sm:w-[128px] sm:h-[128px] p-1.5 rounded-3xl bg-[#FFFDF7]/95 backdrop-blur-md shadow-xl border-2 border-amber-300 flex items-center justify-center">
        {/* Forward (Up) Button */}
        <button
          type="button"
          id="btn-move-forward"
          onPointerDown={() => handlePointerDownDirection('up')}
          onPointerUp={handlePointerUpDirection}
          onPointerLeave={handlePointerUpDirection}
          className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
            activeDirection === 'up'
              ? 'bg-emerald-600 text-white border-emerald-700 scale-95'
              : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border-emerald-300/80 active:bg-emerald-300'
          }`}
          title="Move Forward"
          aria-label="Move Forward"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Backward (Down) Button */}
        <button
          type="button"
          id="btn-move-backward"
          onPointerDown={() => handlePointerDownDirection('down')}
          onPointerUp={handlePointerUpDirection}
          onPointerLeave={handlePointerUpDirection}
          className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
            activeDirection === 'down'
              ? 'bg-emerald-600 text-white border-emerald-700 scale-95'
              : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border-emerald-300/80 active:bg-emerald-300'
          }`}
          title="Move Backward"
          aria-label="Move Backward"
        >
          <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Left Button */}
        <button
          type="button"
          id="btn-move-left"
          onPointerDown={() => handlePointerDownDirection('left')}
          onPointerUp={handlePointerUpDirection}
          onPointerLeave={handlePointerUpDirection}
          className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
            activeDirection === 'left'
              ? 'bg-emerald-600 text-white border-emerald-700 scale-95'
              : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border-emerald-300/80 active:bg-emerald-300'
          }`}
          title="Move Left"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* Right Button */}
        <button
          type="button"
          id="btn-move-right"
          onPointerDown={() => handlePointerDownDirection('right')}
          onPointerUp={handlePointerUpDirection}
          onPointerLeave={handlePointerUpDirection}
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs border ${
            activeDirection === 'right'
              ? 'bg-emerald-600 text-white border-emerald-700 scale-95'
              : 'bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 border-emerald-300/80 active:bg-emerald-300'
          }`}
          title="Move Right"
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[3]" />
        </button>

        {/* CENTER COMPACT SQUARE STOP / PAUSE BUTTON */}
        <button
          type="button"
          id="btn-controller-stop"
          onClick={handleInstantStop}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm border-2 z-10 ${
            isStoppedFlash
              ? 'bg-rose-600 text-white border-rose-300 scale-105 ring-2 ring-rose-400'
              : 'bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white border-rose-400 active:scale-90'
          }`}
          title="Stop / Pause Character"
          aria-label="Stop Character Movement"
        >
          <Square className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white stroke-white stroke-[2]" />
        </button>
      </div>
    </div>
  );
};
