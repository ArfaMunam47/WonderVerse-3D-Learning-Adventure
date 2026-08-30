import React, { useEffect, useRef } from 'react';

/**
 * WONDERMIDO - Small, Polished, Playful Game Cursor
 *
 * Characteristics:
 * - High performance: Direct transform updates on passive mouse events (0 CPU when idle)
 * - Compact & non-intrusive (never covers text or important content)
 * - Precise hot-spot tip at (0, 0)
 * - Playful game-style star-arrow design with warm golden/amber glow
 * - Instant hover reactions (gentle scale, soft sparkle, warm aura expansion)
 * - Automatically disabled on touch/mobile devices
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Touch/mobile device guard - do not activate custom cursor on touch
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      if (isTouch) return;
    }

    const cursorEl = cursorRef.current;
    const auraEl = auraRef.current;
    if (!cursorEl || !auraEl) return;

    let isVisible = false;
    let isHoveringInteractive = false;
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

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        // Text input field check - hide cursor to allow native I-beam
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

        const interactive = !!target.closest('button, a, [role="button"], input[type="button"], .cursor-pointer, [data-interactive="true"]');
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
      {/* Dynamic Cursor Styles */}
      <style>{`
        /* Hide native cursor on desktop fine-pointer devices */
        @media (pointer: fine) {
          body, button, a, [role="button"], input[type="button"], select, .cursor-pointer {
            cursor: none !important;
          }
        }

        #wondermido-game-cursor {
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

        #wondermido-game-cursor.cursor-hover-active {
          scale: 1.18;
          filter: drop-shadow(0 2px 6px rgba(245, 158, 11, 0.65));
        }

        #wondermido-game-cursor.cursor-click-active {
          scale: 0.92;
        }

        #wondermido-cursor-aura {
          position: fixed;
          top: -10px;
          left: -10px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, rgba(245, 158, 11, 0.12) 60%, transparent 100%);
          pointer-events: none;
          z-index: 999998;
          opacity: 0;
          transition: opacity 0.2s ease, width 0.25s ease, height 0.25s ease, top 0.25s ease, left 0.25s ease, background 0.25s ease;
          will-change: transform, opacity;
        }

        #wondermido-cursor-aura.aura-hover-active {
          top: -16px;
          left: -16px;
          width: 32px;
          height: 32px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.55) 0%, rgba(245, 158, 11, 0.2) 65%, transparent 100%);
        }

        #wondermido-cursor-aura.aura-click-active {
          top: -8px;
          left: -8px;
          width: 16px;
          height: 16px;
          background: radial-gradient(circle, rgba(245, 158, 11, 0.7) 0%, transparent 100%);
        }
      `}</style>

      {/* Subtle Glowing Aura */}
      <div id="wondermido-cursor-aura" ref={auraRef} aria-hidden="true" />

      {/* Small, Polished Game Cursor (Precise Star Pointer Arrow) */}
      <div id="wondermido-game-cursor" ref={cursorRef} aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shiny Amber / Gold Gradient */}
            <linearGradient id="cursorBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="35%" stopColor="#FDE047" />
              <stop offset="75%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            {/* Dark Outline for high contrast on all backgrounds */}
            <linearGradient id="cursorStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>

          {/* Precise Game Arrow / Pointer Path */}
          <path
            d="M 1.5 1.5 L 8.5 20.5 L 12.2 13.2 L 19.5 10.5 Z"
            fill="url(#cursorBodyGrad)"
            stroke="url(#cursorStrokeGrad)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Clean Inner Highlight */}
          <path
            d="M 3.2 3.8 L 7.5 15.5 L 9.8 11.2 L 15.2 9.2 Z"
            fill="#FFFBEB"
            fillOpacity="0.65"
          />

          {/* Cute Mini Star Sparkle Gem at Center */}
          <circle cx="11" cy="11" r="1.6" fill="#FFFFFF" />
          <circle cx="11" cy="11" r="0.9" fill="#D97706" />
        </svg>
      </div>
    </>
  );
};
