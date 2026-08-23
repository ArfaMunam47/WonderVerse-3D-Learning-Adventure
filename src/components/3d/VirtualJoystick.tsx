import React, { useRef, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface VirtualJoystickProps {
  onMove: (dir: { x: number; z: number }) => void;
  onRotate: (deltaYaw: number) => void;
  onReset: () => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onMove,
  onRotate,
  onReset
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentVector = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const loop = () => {
      if (Math.abs(currentVector.current.x) > 0.01 || Math.abs(currentVector.current.z) > 0.01) {
        onMove(currentVector.current);
      }
      animFrameId.current = requestAnimationFrame(loop);
    };
    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [onMove]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTouchId.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      startPos.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      handleTouchMove(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        const dx = touch.clientX - startPos.current.x;
        const dy = touch.clientY - startPos.current.y;
        const maxDist = 38;
        const dist = Math.hypot(dx, dy);
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);

        const nx = Math.cos(angle) * (clampedDist / maxDist);
        const ny = Math.sin(angle) * (clampedDist / maxDist);

        currentVector.current = { x: nx, z: ny };

        if (knobRef.current) {
          knobRef.current.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
        }
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId.current) {
        activeTouchId.current = null;
        currentVector.current = { x: 0, z: 0 };
        if (knobRef.current) {
          knobRef.current.style.transform = 'translate(0px, 0px)';
        }
        break;
      }
    }
  };

  return (
    <div
      id="virtual-mobile-joystick-dock"
      className="absolute bottom-6 left-4 z-20 flex items-end gap-3 pointer-events-auto select-none"
    >
      {/* 1. Touch Joystick Pad */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-[#FFFDF7]/90 backdrop-blur-md shadow-xl border-2 border-amber-300 flex items-center justify-center relative touch-none cursor-pointer"
        aria-label="Movement Joystick"
      >
        <div className="absolute inset-2 rounded-full border border-amber-200/60 border-dashed pointer-events-none" />
        <div
          ref={knobRef}
          className="w-12 h-12 rounded-full bg-sky-500 text-white shadow-md border-2 border-white flex items-center justify-center pointer-events-none transition-transform duration-75"
        >
          <div className="w-4 h-4 rounded-full bg-white/70" />
        </div>
      </div>

      {/* 2. Quick Turn and Center Buttons */}
      <div className="flex flex-col gap-1.5 pb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onRotate(Math.PI / 6)}
            className="w-9 h-9 rounded-xl bg-[#FFFDF7]/90 hover:bg-amber-50 text-stone-700 flex items-center justify-center border border-amber-300 shadow-sm active:scale-95 transition-transform cursor-pointer"
            title="Turn Left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onReset}
            className="w-9 h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer"
            title="Center Meadow View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRotate(-Math.PI / 6)}
            className="w-9 h-9 rounded-xl bg-[#FFFDF7]/90 hover:bg-amber-50 text-stone-700 flex items-center justify-center border border-amber-300 shadow-sm active:scale-95 transition-transform cursor-pointer"
            title="Turn Right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
