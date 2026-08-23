import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Square, Hand } from 'lucide-react';
import { audioService } from '../../utils/audio';

interface CompactMovementClusterProps {
  onMove: (dir: { x: number; z: number }) => void;
  onRotate?: (deltaYaw: number) => void;
  onReset: () => void;
  onStop: () => void;
  reducedMotion?: boolean;
}

export const CompactMovementCluster: React.FC<CompactMovementClusterProps> = ({
  onMove,
  onReset,
  onStop,
  reducedMotion = false
}) => {
  const currentVector = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const animFrameId = useRef<number | null>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
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

  // Touch drag or tap over D-pad cluster
  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    handleTouchMove(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!clusterRef.current) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        const rect = clusterRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = touch.clientX - centerX;
        const dy = touch.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist < 10) {
          currentVector.current = { x: 0, z: 0 };
          setActiveDirection(null);
        } else {
          const maxDist = rect.width / 2;
          const clamped = Math.min(dist, maxDist);
          const angle = Math.atan2(dy, dx);

          // Normalize vector (x: horizontal, z: forward/backward)
          const nx = Math.cos(angle) * (clamped / maxDist);
          const ny = Math.sin(angle) * (clamped / maxDist);
          currentVector.current = { x: nx, z: ny };

          // Visual active button highlight
          if (Math.abs(dx) > Math.abs(dy)) {
            setActiveDirection(dx > 0 ? 'right' : 'left');
          } else {
            setActiveDirection(dy > 0 ? 'down' : 'up');
          }
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        activeTouchId.current = null;
        currentVector.current = { x: 0, z: 0 };
        setActiveDirection(null);
        break;
      }
    }
  };

  // Button hold handlers for mouse / pointer
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

  // Emergency / Accessibility Instant Stop Handler
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
      id="compact-movement-cluster"
      className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-2 pointer-events-auto select-none"
    >
      {/* 1. Large, Obvious STOP Button */}
      <button
        type="button"
        id="character-instant-stop-btn"
        onClick={handleInstantStop}
        className={`h-12 md:h-14 px-4 md:px-5 rounded-2xl md:rounded-3xl flex items-center justify-center gap-2 font-display font-black text-sm md:text-base border-2 shadow-lg cursor-pointer transition-all active:scale-95 ${
          isStoppedFlash
            ? 'bg-rose-600 text-white border-rose-300 scale-105 ring-4 ring-rose-400/50'
            : 'bg-[#FFFDF7] hover:bg-rose-50 text-rose-700 border-rose-300 hover:border-rose-400'
        }`}
        title="Stop moving immediately"
        aria-label="Stop Character Movement"
      >
        <div className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
          <Square className="w-3.5 h-3.5 fill-white" />
        </div>
        <span>STOP</span>
      </button>

      {/* 2. Tactile D-Pad Controller */}
      <div className="flex flex-col items-center gap-1">
        <div
          ref={clusterRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#FFFDF7]/95 backdrop-blur-md shadow-lg border-2 border-amber-300 p-1 relative flex items-center justify-center touch-none transition-transform active:scale-[0.98]"
          aria-label="Meadow movement controls"
        >
          {/* Top Button (Walk Forward) */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('up')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute top-1 left-1/2 -translate-x-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-stone-700 transition-all cursor-pointer ${
              activeDirection === 'up'
                ? 'bg-sky-600 text-white shadow-xs scale-105'
                : 'hover:bg-amber-100/70'
            }`}
            title="Walk Forward (W or Up Arrow)"
            aria-label="Move Forward"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Bottom Button (Walk Backward) */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('down')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-stone-700 transition-all cursor-pointer ${
              activeDirection === 'down'
                ? 'bg-sky-600 text-white shadow-xs scale-105'
                : 'hover:bg-amber-100/70'
            }`}
            title="Walk Backward (S or Down Arrow)"
            aria-label="Move Backward"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          {/* Left Button (Walk Left) */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('left')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-stone-700 transition-all cursor-pointer ${
              activeDirection === 'left'
                ? 'bg-sky-600 text-white shadow-xs scale-105'
                : 'hover:bg-amber-100/70'
            }`}
            title="Walk Left (A or Left Arrow)"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Right Button (Walk Right) */}
          <button
            type="button"
            onPointerDown={() => handlePointerDownDirection('right')}
            onPointerUp={handlePointerUpDirection}
            onPointerLeave={handlePointerUpDirection}
            className={`absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-stone-700 transition-all cursor-pointer ${
              activeDirection === 'right'
                ? 'bg-sky-600 text-white shadow-xs scale-105'
                : 'hover:bg-amber-100/70'
            }`}
            title="Walk Right (D or Right Arrow)"
            aria-label="Move Right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Center Recenter / Reset Button (●) */}
          <button
            type="button"
            onClick={() => {
              audioService.playSparkle();
              onReset();
            }}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow-xs flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-10"
            title="Recenter Camera & Explorer"
            aria-label="Recenter Explorer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop Helper Key Indicator */}
        <span className="hidden md:inline-block text-[10px] font-bold text-stone-600 bg-[#FFFDF7]/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-amber-200 shadow-2xs">
          WASD / Arrow Keys
        </span>
      </div>
    </div>
  );
};
