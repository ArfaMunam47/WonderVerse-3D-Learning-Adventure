import React, { useEffect, useRef } from 'react';

/**
 * Wonder Meadow - Ultra-Lightweight & Performant Child-Friendly Custom Pointer
 *
 * Architecture & Performance Rules:
 * 1. Zero React state updates on mousemove (completely eliminates re-renders and lag).
 * 2. Direct transform manipulation via requestAnimationFrame with GPU hardware acceleration (`translate3d`).
 * 3. Exact synchronization with pointer position (no artificial latency or trailing lag).
 * 4. Touch device detection: completely removes custom cursor element on touch devices (`pointer: coarse`).
 * 5. Full support for `prefers-reduced-motion` and system cursor fallbacks.
 * 6. Interactive state detection (buttons, links, zone cards, text inputs, disabled elements).
 */

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorAuraRef = useRef<HTMLDivElement>(null);
  const isTouchRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Detect if primary pointer is coarse (Touch screens: iOS / Android / Touch tablets)
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      if (isTouch) {
        isTouchRef.current = true;
        return; // Do NOT attach mouse listeners on touch devices
      }
    }

    const dotEl = cursorDotRef.current;
    const auraEl = cursorAuraRef.current;
    if (!dotEl || !auraEl) return;

    let targetX = -100;
    let targetY = -100;
    let isVisible = false;
    let isClicking = false;
    let isHovering = false;
    let isZoneHover = false;
    let isTextInput = false;
    let isHidden = false;
    let animationFrameId: number;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check target element and apply CSS state classes directly without React re-rendering
    const updateInteractiveState = (target: HTMLElement | null) => {
      if (!target) return;

      const inputEl = target.closest('input, textarea, [contenteditable="true"]');
      isTextInput = !!inputEl;

      const disabledEl = target.closest('[disabled], [aria-disabled="true"], .opacity-50');
      const interactiveEl = target.closest('button, a, select, [role="button"], .interactive-target');
      const zoneEl = target.closest('.zone-card, [data-zone-target], .landmark-3d');

      isHovering = !!(interactiveEl && !disabledEl);
      isZoneHover = !!zoneEl;

      // Update classes directly on DOM elements
      if (isTextInput || disabledEl) {
        isHidden = isTextInput; // Hide custom follower over text inputs so the native I-beam is crisp
        auraEl.style.opacity = isTextInput ? '0' : '0.15';
        dotEl.style.opacity = isTextInput ? '0' : '0.4';
      } else {
        isHidden = false;
        auraEl.style.opacity = isVisible ? '1' : '0';
        dotEl.style.opacity = isVisible ? '1' : '0';

        if (isZoneHover) {
          auraEl.className = 'absolute rounded-full pointer-events-none transition-all duration-150 ease-out will-change-transform w-9 h-9 -top-4.5 -left-4.5 bg-amber-400/35 border border-amber-300/60 shadow-sm scale-110';
          dotEl.className = 'absolute rounded-full pointer-events-none transition-transform duration-100 ease-out will-change-transform w-4 h-4 -top-2 -left-2 bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-xs scale-110';
        } else if (isHovering) {
          auraEl.className = 'absolute rounded-full pointer-events-none transition-all duration-150 ease-out will-change-transform w-8 h-8 -top-4 -left-4 bg-emerald-400/30 border border-emerald-300/50 shadow-xs scale-105';
          dotEl.className = 'absolute rounded-full pointer-events-none transition-transform duration-100 ease-out will-change-transform w-3.5 h-3.5 -top-[7px] -left-[7px] bg-emerald-500 border-2 border-white shadow-xs scale-110';
        } else {
          auraEl.className = 'absolute rounded-full pointer-events-none transition-all duration-150 ease-out will-change-transform w-6 h-6 -top-3 -left-3 bg-sky-400/20 border border-sky-300/30';
          dotEl.className = 'absolute rounded-full pointer-events-none transition-transform duration-100 ease-out will-change-transform w-3 h-3 -top-1.5 -left-1.5 bg-sky-600 border border-white shadow-xs';
        }
      }
    };

    // Render loop using requestAnimationFrame for 60/120fps stutter-free movement
    const renderLoop = () => {
      if (isVisible && !isHidden) {
        const dotTransform = `translate3d(${targetX}px, ${targetY}px, 0) ${isClicking ? 'scale(0.8)' : 'scale(1)'}`;
        const auraTransform = `translate3d(${targetX}px, ${targetY}px, 0) ${isClicking ? 'scale(0.85)' : 'scale(1)'}`;

        dotEl.style.transform = dotTransform;
        auraEl.style.transform = auraTransform;
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        dotEl.style.opacity = '1';
        auraEl.style.opacity = '1';
      }

      updateInteractiveState(e.target as HTMLElement | null);
    };

    const onMouseDown = () => {
      isClicking = true;
      if (dotEl && !prefersReducedMotion) {
        dotEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(0.8)`;
      }
    };

    const onMouseUp = () => {
      isClicking = false;
      if (dotEl && !prefersReducedMotion) {
        dotEl.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) scale(1)`;
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      dotEl.style.opacity = '0';
      auraEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      dotEl.style.opacity = '1';
      auraEl.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <div
      id="wonder-meadow-custom-pointer-layer"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none hidden md:block"
      aria-hidden="true"
    >
      {/* Soft Ambient Meadow Aura (Follows without lag) */}
      <div
        ref={cursorAuraRef}
        className="absolute rounded-full pointer-events-none opacity-0 will-change-transform transition-opacity duration-150"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />

      {/* Main Sharp Wonder Dot */}
      <div
        ref={cursorDotRef}
        className="absolute rounded-full pointer-events-none opacity-0 will-change-transform transition-opacity duration-150"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </div>
  );
};
