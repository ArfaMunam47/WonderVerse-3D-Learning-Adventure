import React, { useEffect, useRef } from 'react';

/**
 * Wonder Meadow - 3D Adventure Game Magic Wand & Crystal Pointer
 *
 * Designed to feel like a high-end 3D adventure game:
 * 1. 3D Beveled Star Magic Wand pointer with sharp tip hotspot at (0, 0).
 * 2. High-Contrast Reactive Palettes:
 *    - OVER ORANGE/AMBER BUTTONS (e.g. "Let's Explore", "Start Adventure"):
 *      Transforms instantly into a radiant Electric Cyan & Diamond Wand with a vibrant glowing halo.
 *    - OVER HERO CHARACTERS / PODIUMS:
 *      Transforms into a Golden Celestial Scepter with a rotating stardust ring.
 *    - OVER GREEN / MEADOW ZONES:
 *      Transforms into a Brilliant Ruby Gem Wand.
 *    - DEFAULT (Sky, Clouds, Cards):
 *      Luminous 3D Golden Star Wand with sharp dark contour for maximum visibility.
 * 3. Dynamic Click Reactions:
 *    - 3D wand tilt & compression.
 *    - Bursting star sparks + expanding sonic light ripple.
 * 4. Trailing stardust particle trail.
 * 5. 60/120 FPS hardware acceleration using requestAnimationFrame.
 */

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const trailContainerRef = useRef<HTMLDivElement>(null);
  const burstContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for touch-only devices
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      if (isTouch) {
        return;
      }
    }

    const cursorEl = cursorRef.current;
    const auraEl = auraRef.current;
    const trailContainer = trailContainerRef.current;
    const burstContainer = burstContainerRef.current;
    if (!cursorEl || !auraEl || !trailContainer || !burstContainer) return;

    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;
    let isVisible = false;
    let isClicking = false;
    let currentTheme: 'default' | 'orange-contrast' | 'emerald-contrast' | 'character-target' | 'interactive' = 'default';
    let isHidden = false;
    let animationFrameId: number;
    let frameCount = 0;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateCursorVisual = () => {
      // Consistent 3D Golden Adventure Star Magic Wand
      cursorEl.innerHTML = `
        <div class="relative w-11 h-11 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
          <svg viewBox="0 0 48 48" class="w-10 h-10 pointer-events-none transform -rotate-10">
            <defs>
              <linearGradient id="goldWandHead" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFDF0"/>
                <stop offset="35%" stop-color="#FDE047"/>
                <stop offset="70%" stop-color="#F59E0B"/>
                <stop offset="100%" stop-color="#78350F"/>
              </linearGradient>
              <linearGradient id="goldWandShaft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FEF3C7"/>
                <stop offset="60%" stop-color="#D97706"/>
                <stop offset="100%" stop-color="#451A03"/>
              </linearGradient>
            </defs>
            <!-- 3D Wand Shaft -->
            <path d="M14 26 L2 38 C0.5 39.5 2 41 3.5 42.5 L6 45 C7.5 46.5 9 45 10.5 43.5 L22 32 Z" fill="url(#goldWandShaft)" stroke="#451A03" stroke-width="1.5"/>
            <!-- 3D Faceted Star Head -->
            <polygon points="24,2 29,14 42,15 32,24 35,37 24,30 13,37 16,24 6,15 19,14" fill="url(#goldWandHead)" stroke="#451A03" stroke-width="2" stroke-linejoin="round"/>
            <!-- Facet Highlights -->
            <line x1="24" y1="2" x2="24" y2="30" stroke="#FFFFFF" stroke-width="1.4" opacity="0.85"/>
            <line x1="6" y1="15" x2="42" y2="15" stroke="#FFFFFF" stroke-width="1.2" opacity="0.75"/>
            <!-- Glowing Jewel Center -->
            <circle cx="24" cy="20" r="4.2" fill="#FFFFFF" stroke="#B45309" stroke-width="1.5"/>
            <circle cx="24" cy="20" r="2.2" fill="#F59E0B"/>
          </svg>
        </div>
      `;
      auraEl.className = 'absolute rounded-full pointer-events-none transition-all duration-200 w-12 h-12 -top-6 -left-6 bg-amber-400/25 border border-amber-300/40 shadow-[0_0_14px_rgba(245,158,11,0.4)]';
    };

    const updateInteractiveTheme = (target: HTMLElement | null) => {
      if (!target) return;

      const inputEl = target.closest('input, textarea, [contenteditable="true"]');
      if (inputEl) {
        isHidden = true;
        cursorEl.style.opacity = '0';
        auraEl.style.opacity = '0';
        return;
      }
      isHidden = false;

      const disabledEl = target.closest('[disabled], [aria-disabled="true"], .opacity-50');
      if (disabledEl) {
        cursorEl.style.opacity = '0.35';
        auraEl.style.opacity = '0.15';
        return;
      }

      cursorEl.style.opacity = isVisible ? '1' : '0';
      auraEl.style.opacity = isVisible ? '1' : '0';
    };

    // Stardust trail
    const spawnStardust = (x: number, y: number) => {
      if (prefersReducedMotion) return;

      const star = document.createElement('div');
      const size = Math.floor(Math.random() * 4) + 3;
      const color = '#FCD34D';

      star.className = 'absolute rounded-full pointer-events-none transition-all duration-500 ease-out';
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.backgroundColor = color;
      star.style.boxShadow = `0 0 8px ${color}`;
      star.style.opacity = '0.85';
      star.style.transform = 'translate(-50%, -50%) scale(1)';

      trailContainer.appendChild(star);

      requestAnimationFrame(() => {
        star.style.transform = `translate(-50%, ${Math.random() * 16 + 8}px) scale(0.2)`;
        star.style.opacity = '0';
      });

      setTimeout(() => {
        star.remove();
      }, 500);
    };

    // Click burst & sound energy wave
    const spawnClickBurst = (x: number, y: number) => {
      if (prefersReducedMotion) return;

      const burst = document.createElement('div');
      burst.className = 'absolute pointer-events-none';
      burst.style.left = `${x}px`;
      burst.style.top = `${y}px`;

      // Expanding Light Ring
      const ripple = document.createElement('div');
      ripple.className = 'absolute rounded-full border-2 transition-all duration-400 ease-out -translate-x-1/2 -translate-y-1/2';
      ripple.style.borderColor = '#F59E0B';
      ripple.style.width = '12px';
      ripple.style.height = '12px';
      ripple.style.opacity = '1';
      burst.appendChild(ripple);

      // Star sparks
      const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FFFFFF', '#FEF08A'];

      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      angles.forEach((angle, idx) => {
        const star = document.createElement('div');
        const rad = (angle * Math.PI) / 180;
        const dist = 30;
        const tx = Math.cos(rad) * dist;
        const ty = Math.sin(rad) * dist;

        star.className = 'absolute w-3 h-3 rounded-full -top-1.5 -left-1.5 transition-all duration-350 ease-out';
        star.style.backgroundColor = colors[idx % colors.length];
        star.style.boxShadow = `0 0 8px ${colors[idx % colors.length]}`;
        star.style.transform = 'scale(1) translate(0, 0)';
        star.style.opacity = '1';

        burst.appendChild(star);

        requestAnimationFrame(() => {
          star.style.transform = `scale(0.2) translate(${tx}px, ${ty}px)`;
          star.style.opacity = '0';
        });
      });

      requestAnimationFrame(() => {
        ripple.style.width = '64px';
        ripple.style.height = '64px';
        ripple.style.opacity = '0';
      });

      burstContainer.appendChild(burst);
      setTimeout(() => {
        burst.remove();
      }, 400);
    };

    // Render loop
    const renderLoop = () => {
      if (isVisible && !isHidden) {
        currentX += (targetX - currentX) * 0.45;
        currentY += (targetY - currentY) * 0.45;

        // Offset so the top-left star tip points exactly at target (x, y)
        const scaleVal = isClicking ? 'scale(0.88) rotate(-4deg)' : 'scale(1) rotate(0deg)';
        cursorEl.style.transform = `translate3d(${targetX - 4}px, ${targetY - 2}px, 0) ${scaleVal}`;
        auraEl.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) ${scaleVal}`;

        frameCount++;
        if (frameCount % 4 === 0 && Math.hypot(targetX - currentX, targetY - currentY) > 2) {
          spawnStardust(targetX, targetY);
        }
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    updateCursorVisual();
    animationFrameId = requestAnimationFrame(renderLoop);

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        currentX = targetX;
        currentY = targetY;
        cursorEl.style.opacity = '1';
        auraEl.style.opacity = '1';
      }

      updateInteractiveTheme(e.target as HTMLElement | null);
    };

    const onMouseDown = (e: MouseEvent) => {
      isClicking = true;
      spawnClickBurst(e.clientX, e.clientY);
    };

    const onMouseUp = () => {
      isClicking = false;
    };

    const onMouseLeave = () => {
      isVisible = false;
      cursorEl.style.opacity = '0';
      auraEl.style.opacity = '0';
    };

    const onMouseEnter = () => {
      isVisible = true;
      cursorEl.style.opacity = '1';
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
      id="wonder-meadow-magical-cursor-layer"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none hidden md:block"
      aria-hidden="true"
    >
      <div ref={trailContainerRef} className="absolute inset-0 pointer-events-none" />
      <div ref={burstContainerRef} className="absolute inset-0 pointer-events-none" />
      <div
        ref={auraRef}
        className="absolute rounded-full pointer-events-none opacity-0 will-change-transform transition-opacity duration-150"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
      <div
        ref={cursorRef}
        className="absolute pointer-events-none opacity-0 will-change-transform transition-opacity duration-150 flex items-center justify-center"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      />
    </div>
  );
};
