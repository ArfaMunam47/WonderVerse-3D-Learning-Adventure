import React, { useEffect, useState, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isHoveringZone, setIsHoveringZone] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if device is touch primary
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check target element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, canvas, [role="button"], .interactive-target, select');
      setIsHoveringInteractive(!!interactive);

      const zoneCard = target.closest('.zone-card, [data-zone-target], .landmark-3d');
      setIsHoveringZone(!!zoneCard);
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev.slice(-4), newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 700);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  if (isTouchDevice || position.x < 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full border-2 border-teal-400 bg-teal-200/30 animate-ping duration-700 pointer-events-none"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40
          }}
        />
      ))}

      {/* Main Cursor Wand / Indicator */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 transition-transform duration-75 ease-out pointer-events-none will-change-transform"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`
        }}
      >
        {/* Soft glowing aura */}
        <div
          className={`absolute -top-4 -left-4 rounded-full transition-all duration-300 ${
            isHoveringZone
              ? 'w-12 h-12 bg-amber-400/35 blur-md scale-125'
              : isHoveringInteractive
              ? 'w-10 h-10 bg-teal-400/30 blur-sm scale-110'
              : 'w-8 h-8 bg-sky-300/20 blur-[2px] scale-100'
          }`}
        />

        {/* Center dot / ring */}
        <div
          className={`relative rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            isClicking
              ? 'scale-75 bg-teal-600'
              : isHoveringZone
              ? 'w-7 h-7 -top-3.5 -left-3.5 bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white scale-110 ring-4 ring-amber-300/40'
              : isHoveringInteractive
              ? 'w-6 h-6 -top-3 -left-3 bg-teal-500 border-2 border-white scale-110 ring-4 ring-teal-200/50'
              : 'w-4 h-4 -top-2 -left-2 bg-slate-800 border border-white'
          }`}
        >
          {isHoveringZone && (
            <span className="text-[11px] animate-spin leading-none">✨</span>
          )}
        </div>
      </div>
    </div>
  );
};
