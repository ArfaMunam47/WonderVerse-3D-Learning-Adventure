import React, { useEffect, useRef } from 'react';

/**
 * CustomCursor - Wonder Meadow Friendly Pointer
 *
 * Characteristics:
 * - Ultra-lightweight & silky smooth (0 CPU overhead when idle)
 * - Unified Wonder Meadow Palette: Meadow green (#4A7C59, #6C9E78), soft ivory (#FFFDF9), warm gold center (#F6C844), slate outline (#23272F)
 * - Hot-spot tip at (0, 0)
 * - Subtle aura scale when hovering interactive elements
 * - Gentle sparkle reaction over character stage
 * - Auto-disabled on mobile/touch screens
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch/mobile guard - custom cursor is purely for fine pointer devices
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      if (isTouch) return;
    }

    const cursorEl = cursorRef.current;
    const auraEl = auraRef.current;
    if (!cursorEl || !auraEl) return;

    let isVisible = false;
    let isHoveringInteractive = false;
    let isHoveringHero = false;
    let isHidden = false;

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      auraEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      if (!isVisible) {
        isVisible = true;
        cursorEl.style.opacity = '1';
        auraEl.style.opacity = '1';
      }

      const target = e.target as HTMLElement | null;
      if (target) {
        // Hide on text inputs
        const isInput = !!target.closest('input, textarea, [contenteditable="true"]');
        if (isInput) {
          if (!isHidden) {
            isHidden = true;
            cursorEl.style.opacity = '0';
            auraEl.style.opacity = '0';
          }
          return;
        } else if (isHidden) {
          isHidden = false;
          cursorEl.style.opacity = '1';
          auraEl.style.opacity = '1';
        }

        // Check if hovering character
        const hero = !!target.closest('#hero-character-touch-target, #hero-character-meadow-stage');
        if (hero !== isHoveringHero) {
          isHoveringHero = hero;
          if (isHoveringHero) {
            cursorEl.classList.add('cursor-hero-hover');
            auraEl.classList.add('aura-hero-hover');
          } else {
            cursorEl.classList.remove('cursor-hero-hover');
            auraEl.classList.remove('aura-hero-hover');
          }
        }

        // Check if hovering buttons / interactive
        const interactive = !hero && !!target.closest('button, a, [role="button"], input[type="button"], .cursor-pointer, [data-interactive="true"]');
        if (interactive !== isHoveringInteractive) {
          isHoveringInteractive = interactive;
          if (isHoveringInteractive) {
            cursorEl.classList.add('cursor-hover-active');
            auraEl.classList.add('aura-hover-active');
          } else {
            cursorEl.classList.remove('cursor-hover-active');
            auraEl.classList.remove('aura-hover-active');
          }
        }
      }
    };

    const onMouseDown = () => {
      cursorEl.classList.add('cursor-click-active');
      auraEl.classList.add('aura-click-active');
    };

    const onMouseUp = () => {
      cursorEl.classList.remove('cursor-click-active');
      auraEl.classList.remove('aura-click-active');
    };

    const onMouseLeave = () => {
      isVisible = false;
      cursorEl.style.opacity = '0';
      auraEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      if (!isHidden) {
        cursorEl.style.opacity = '1';
        auraEl.style.opacity = '1';
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, button, a, [role="button"], input[type="button"], select, .cursor-pointer {
            cursor: none !important;
          }
        }

        #wonder-meadow-game-cursor {
          position: fixed;
          top: 0;
          left: 0;
          width: 22px;
          height: 22px;
          pointer-events: none;
          z-index: 999999;
          opacity: 0;
          transform-origin: 0 0;
          transition: opacity 0.15s ease, scale 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform, opacity;
        }

        #wonder-meadow-game-cursor.cursor-hover-active {
          scale: 1.12;
          filter: drop-shadow(0 2px 6px rgba(74, 124, 89, 0.4));
        }

        #wonder-meadow-game-cursor.cursor-hero-hover {
          scale: 1.15;
          filter: drop-shadow(0 2px 8px rgba(246, 200, 68, 0.5));
        }

        #wonder-meadow-game-cursor.cursor-click-active {
          scale: 0.92;
        }

        #wonder-meadow-cursor-aura {
          position: fixed;
          top: -10px;
          left: -10px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(129, 176, 140, 0.28) 0%, rgba(74, 124, 89, 0.08) 60%, transparent 100%);
          pointer-events: none;
          z-index: 999998;
          opacity: 0;
          transition: opacity 0.2s ease, width 0.22s ease, height 0.22s ease, top 0.22s ease, left 0.22s ease, background 0.22s ease;
          will-change: transform, opacity;
        }

        #wonder-meadow-cursor-aura.aura-hover-active {
          top: -15px;
          left: -15px;
          width: 30px;
          height: 30px;
          background: radial-gradient(circle, rgba(129, 176, 140, 0.45) 0%, rgba(74, 124, 89, 0.15) 65%, transparent 100%);
        }

        #wonder-meadow-cursor-aura.aura-hero-hover {
          top: -16px;
          left: -16px;
          width: 32px;
          height: 32px;
          background: radial-gradient(circle, rgba(246, 200, 68, 0.45) 0%, rgba(129, 176, 140, 0.2) 65%, transparent 100%);
        }

        #wonder-meadow-cursor-aura.aura-click-active {
          top: -6px;
          left: -6px;
          width: 12px;
          height: 12px;
          background: radial-gradient(circle, rgba(74, 124, 89, 0.5) 0%, transparent 100%);
        }
      `}</style>

      {/* Gentle Soft Aura */}
      <div id="wonder-meadow-cursor-aura" ref={auraRef} aria-hidden="true" />

      {/* Unified Picture-Book Pointer */}
      <div id="wonder-meadow-game-cursor" ref={cursorRef} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full drop-shadow-[0_2px_3px_rgba(35,39,47,0.18)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wmCursorBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="45%" stopColor="#E2F0E6" />
              <stop offset="90%" stopColor="#5A8E67" />
              <stop offset="100%" stopColor="#4A7C59" />
            </linearGradient>
            <linearGradient id="wmCursorStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D3139" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>

          {/* Smooth Rounded Pointer Body */}
          <path
            d="M 2 2 L 8.5 20.5 L 12.2 13.2 L 19.5 10.5 Z"
            fill="url(#wmCursorBodyGrad)"
            stroke="url(#wmCursorStrokeGrad)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Soft Highlight */}
          <path
            d="M 3.8 4.2 L 7.6 15.2 L 9.8 11.2 L 15.2 9.2 Z"
            fill="#FFFDF9"
            fillOpacity="0.8"
          />

          {/* Centered Gentle Dot */}
          <circle cx="11.5" cy="11.5" r="1.3" fill="#FFFFFF" />
          <circle cx="11.5" cy="11.5" r="0.7" fill="#4A7C59" />
        </svg>
      </div>
    </>
  );
};
