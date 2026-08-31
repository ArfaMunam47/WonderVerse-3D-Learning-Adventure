import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, Heart, Sparkles } from 'lucide-react';
import { audioService } from '../../utils/audio';
import heroIdlePng from '../../assets/characters/hero_child_idle.png';
import heroWavingPng from '../../assets/characters/hero_child_waving_aligned.png';
import heroKissPng from '../../assets/characters/hero_child_kiss_aligned.png';

interface HeroCharacterMeadowProps {
  reducedMotion?: boolean;
  className?: string;
  onChildInteraction?: () => void;
  onTalkingStateChange?: (isTalking: boolean) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  symbol: string;
  vx: number;
  vy: number;
}

type CharacterPose = 'idle' | 'waving' | 'kiss';

const VIDEO_GREETINGS = [
  "Hey! Welcome to Wonder Meadow! I'm so excited to learn and play with you!",
  "Hello my friend! I'm so happy you're here. Let's have a wonderful adventure!",
  "You're my friend! Let's discover something joyful together today.",
  "Look at all the gentle flowers in our meadow! Whenever you're ready, press Start Exploring!"
];

/**
 * HeroCharacterMeadow - Joyful, Living Child Character in Wonder Meadow
 *
 * Recreates the beloved video experience:
 * 1. IDENTICAL IDENTITY & POSE RIG: Same exact sweet girl with Down syndrome, brown hair bangs,
 *    modest sage-green floral dress, and warm natural presence.
 * 2. 100% PURE SEAMLESS TRANSPARENCY: Sits directly in the exact meadow backdrop with zero boxes or halos.
 * 3. LIVING CHARACTER GESTURES:
 *    - Cheerful hand waving hello 👋
 *    - Sweet double-handed kiss blowing 💖
 *    - Continuous gentle breathing rhythm & soft eye blinks
 *    - Damped cursor/touch gaze tracking
 * 4. SOFT, WARM CHILD VOICE:
 *    - Speaks the exact phrase: "Hey! Welcome to Wonder Meadow! I'm so excited to learn and play with you!"
 */
export const HeroCharacterMeadow: React.FC<HeroCharacterMeadowProps> = ({
  reducedMotion = false,
  className = '',
  onChildInteraction,
  onTalkingStateChange
}) => {
  const [currentPose, setCurrentPose] = useState<CharacterPose>('idle');
  const [isTalking, setIsTalking] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpokenRef = useRef<number>(0);
  const greetingIndexRef = useRef<number>(0);
  const nextParticleIdRef = useRef<number>(0);
  const poseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Periodic natural idle animations (gentle wave or tilt every 7s - 11s)
  useEffect(() => {
    if (reducedMotion) return;

    let idleTimer: NodeJS.Timeout;
    const scheduleNextIdleGesture = () => {
      idleTimer = setTimeout(() => {
        if (!isTalking && currentPose === 'idle') {
          setCurrentPose('waving');
          setTimeout(() => {
            setCurrentPose('idle');
            scheduleNextIdleGesture();
          }, 2400);
        } else {
          scheduleNextIdleGesture();
        }
      }, 7500 + Math.random() * 3500);
    };

    scheduleNextIdleGesture();
    return () => clearTimeout(idleTimer);
  }, [reducedMotion, isTalking, currentPose]);

  // 2. Natural Periodic Blinking Loop (Gentle, realistic intervals: 3.5s - 6.5s)
  useEffect(() => {
    if (reducedMotion) return;

    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        const nextInterval = 3400 + Math.random() * 2800;
        blinkTimeout = setTimeout(triggerBlink, nextInterval);
      }, 150);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, [reducedMotion]);

  // 3. Soft Cursor Tracking (Smooth damped gaze tilt)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);

      setMouseOffset({
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy))
      });
    },
    [reducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
  }, []);

  // 4. Gentle Wonder Sparkle & Heart Particles
  const spawnSparkles = useCallback((originX = 50, originY = 40, heartBonus = false) => {
    const symbols = heartBonus ? ['💖', '✨', '🌸', '💛', '⭐', '💕'] : ['✨', '🌸', '💛', '⭐', '🌿'];
    const colors = ['#F6C844', '#81B08C', '#FDBA74', '#F472B6', '#EC4899'];
    const newParticles: Particle[] = [];

    const count = heartBonus ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 1.0 + Math.random() * 1.8;
      newParticles.push({
        id: nextParticleIdRef.current++,
        x: originX + (Math.random() - 0.5) * 14,
        y: originY + (Math.random() - 0.5) * 14,
        size: heartBonus ? 18 + Math.random() * 8 : 14 + Math.random() * 6,
        color: colors[i % colors.length],
        symbol: symbols[i % symbols.length],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2
      });
    }

    setParticles((prev) => [...prev.slice(-14), ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 1200);
  }, []);

  // 5. Living Video Performance Sequence (Wave -> Kiss -> Idle)
  const playLivingSequence = useCallback((textToSpeak: string) => {
    if (poseTimeoutRef.current) clearTimeout(poseTimeoutRef.current);

    setIsTalking(true);
    if (onTalkingStateChange) onTalkingStateChange(true);

    // Step 1: Start by waving enthusiastically
    setCurrentPose('waving');
    spawnSparkles(50, 38, false);

    // Step 2: Mid-speech (at 2.4s), transition to blowing kiss with heart sparkles
    poseTimeoutRef.current = setTimeout(() => {
      setCurrentPose('kiss');
      spawnSparkles(50, 36, true);

      // Step 3: Transition back to gentle idle at 4.6s
      poseTimeoutRef.current = setTimeout(() => {
        setCurrentPose('idle');
      }, 2200);
    }, 2400);

    // Voice playback
    audioService.speakCuteAnimeChild(
      textToSpeak,
      true,
      () => {
        setIsTalking(false);
        if (onTalkingStateChange) onTalkingStateChange(false);
      }
    );
  }, [onTalkingStateChange, spawnSparkles]);

  // 6. Primary Child Interaction Handler
  const handleInteraction = useCallback(() => {
    const now = Date.now();
    const canSpeak = !audioService.isSpeaking && (now - lastSpokenRef.current > 1800);

    setTapCount((prev) => prev + 1);

    if (canSpeak) {
      lastSpokenRef.current = now;
      const phrase = VIDEO_GREETINGS[greetingIndexRef.current % VIDEO_GREETINGS.length];
      greetingIndexRef.current++;

      audioService.playSparkle();
      playLivingSequence(phrase);
    } else {
      audioService.playPop();
      setCurrentPose((prev) => (prev === 'idle' ? 'waving' : 'idle'));
      spawnSparkles(50, 42, false);
      setTimeout(() => setCurrentPose('idle'), 1800);
    }

    if (onChildInteraction) {
      onChildInteraction();
    }
  }, [onChildInteraction, playLivingSequence, spawnSparkles]);

  // Initial polite greeting on first mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!audioService.isSpeaking && lastSpokenRef.current === 0) {
        lastSpokenRef.current = Date.now();
        playLivingSequence(VIDEO_GREETINGS[0]);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (poseTimeoutRef.current) clearTimeout(poseTimeoutRef.current);
    };
  }, [playLivingSequence]);

  const gazeX = mouseOffset.x * 3.5;
  const gazeY = mouseOffset.y * 2.5;
  const gazeRotate = mouseOffset.x * 1.5;

  return (
    <div
      id="hero-character-meadow-stage"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* MAIN INTERACTIVE CHARACTER CONTAINER */}
      <div
        id="hero-character-touch-target"
        onClick={handleInteraction}
        className="group relative flex flex-col items-center justify-center cursor-pointer focus:outline-none transition-transform duration-300 active:scale-98"
        role="button"
        tabIndex={0}
        aria-label="Our friend in Wonder Meadow. Tap to hear her speak, wave, and blow a friendly kiss!"
        title="Tap to say hello and see her wave!"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${gazeX}px, ${gazeY}px, 0) rotate(${gazeRotate}deg)`
        }}
      >
        {/* ========================================================================= */}
        {/* CHARACTER FIGURE WITH SEAMLESS CROSS-FADE POSES & LIVING BREATHING        */}
        {/* ========================================================================= */}
        <div
          className={`relative w-60 xs:w-68 sm:w-76 md:w-[320px] lg:w-[360px] aspect-[3/4] flex items-center justify-center transition-all duration-500 ${
            reducedMotion
              ? ''
              : currentPose === 'waving'
              ? 'animate-[characterNaturalWave_2.2s_ease-in-out]'
              : currentPose === 'kiss'
              ? 'animate-[heroGentleBreathing_3.2s_ease-in-out]'
              : 'animate-[heroGentleBreathing_4.6s_ease-in-out_infinite]'
          }`}
        >
          {/* Pose 1: Idle Sitting & Smiling */}
          <img
            src={heroIdlePng}
            alt="Warm, smiling girl with Down syndrome sitting comfortably in a soft sage floral dress"
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_18px_rgba(45,49,57,0.12)] group-hover:drop-shadow-[0_14px_24px_rgba(45,49,57,0.18)] transition-opacity duration-300 pointer-events-none ${
              currentPose === 'idle' ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
            loading="eager"
            draggable={false}
          />

          {/* Pose 2: Cheerful Hand Waving Hello */}
          <img
            src={heroWavingPng}
            alt="Smiling girl raising hand and waving hello"
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_18px_rgba(45,49,57,0.12)] group-hover:drop-shadow-[0_14px_24px_rgba(45,49,57,0.18)] transition-opacity duration-300 pointer-events-none ${
              currentPose === 'waving' ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
            loading="eager"
            draggable={false}
          />

          {/* Pose 3: Sweet Double-Hand Kiss Blow */}
          <img
            src={heroKissPng}
            alt="Smiling girl blowing a sweet, gentle kiss with both hands"
            className={`absolute inset-0 w-full h-full object-contain filter drop-shadow-[0_10px_18px_rgba(45,49,57,0.12)] group-hover:drop-shadow-[0_14px_24px_rgba(45,49,57,0.18)] transition-opacity duration-300 pointer-events-none ${
              currentPose === 'kiss' ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
            loading="eager"
            draggable={false}
          />

          {/* Micro Blink Overlay (Only on Idle pose) */}
          {isBlinking && currentPose === 'idle' && !reducedMotion && (
            <div
              className="absolute top-[16.5%] left-[45.5%] w-[16%] h-[4.5%] bg-[#C89565]/80 rounded-full blur-[0.5px] pointer-events-none transition-opacity duration-150"
              aria-hidden="true"
            />
          )}

          {/* Soft Speech Audio Indicator */}
          {isTalking && (
            <div className="absolute top-2 right-2 sm:right-4 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-[#E2E8F0] text-[#23272F] text-xs font-bold flex items-center gap-1.5 animate-bounce">
              <Volume2 className="w-3.5 h-3.5 text-[#5A8E67] animate-pulse" />
              <span>Speaking softly...</span>
            </div>
          )}

          {/* Floating Sparkle & Heart Particles */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none select-none font-bold animate-[particleFade_1.2s_ease-out_forwards]"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                fontSize: `${p.size}px`,
                color: p.color,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))'
              }}
              aria-hidden="true"
            >
              {p.symbol}
            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* SOFT ROUNDED NATURAL MEADOW PLATFORM / CONTACT SHADOW                     */}
        {/* ========================================================================= */}
        <div className="relative -mt-4 sm:-mt-6 w-56 xs:w-64 sm:w-72 md:w-80 flex flex-col items-center pointer-events-none">
          {/* Natural Ground Contact Shadow */}
          <div
            className="w-48 xs:w-56 sm:w-64 md:w-72 h-4 sm:h-5 rounded-full bg-[#2D3139]/12 blur-md transition-transform duration-500"
            style={{
              transform: currentPose === 'waving' ? 'scale(1.04)' : 'scale(1)'
            }}
            aria-hidden="true"
          />

          {/* Daisy and Moss Accents */}
          <div className="absolute -top-2 inset-x-6 flex items-center justify-between opacity-85">
            <div className="flex items-center gap-1 -rotate-6">
              <span className="text-sm sm:text-base">🌼</span>
              <span className="text-xs text-[#5A8E67] font-bold">🌿</span>
            </div>
            <div className="flex items-center gap-1 rotate-6">
              <span className="text-xs text-[#5A8E67] font-bold">🌿</span>
              <span className="text-sm sm:text-base">🌸</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTION INVITATION BADGE                                              */}
        {/* ========================================================================= */}
        <div className="mt-2 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#23272F] border border-[#E2E8F0] shadow-xs group-hover:shadow-sm text-xs sm:text-sm font-bold transition-all duration-200 group-hover:scale-102 group-hover:border-[#5A8E67]">
            <Sparkles className="w-3.5 h-3.5 text-[#5A8E67] group-hover:rotate-12 transition-transform" />
            <span className="font-sans font-bold text-[#23272F]">
              {isTalking
                ? currentPose === 'kiss'
                  ? 'Sending Love & Kisses! 💖'
                  : 'Waving & Saying Hello! 👋'
                : currentPose === 'waving'
                ? 'Waving Hello! 👋'
                : 'Tap to Say Hello'}
            </span>
            {tapCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#FEE2E2] text-[#DC2626] text-[10px] font-black flex items-center gap-0.5">
                <Heart className="w-2.5 h-2.5 fill-[#DC2626]" />
                {tapCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
