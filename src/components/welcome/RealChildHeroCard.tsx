import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Heart, Upload, Camera, Volume2, Check } from 'lucide-react';
import { audioService } from '../../utils/audio';
import heroGirlMeadowPhoto from '../../assets/images/hero_girl_meadow_dress_1788200061593.jpg';
import heroGirlBlossomPhoto from '../../assets/images/hero_girl_blossom_1788205447473.jpg';
import heroGirlSunnyPhoto from '../../assets/images/hero_girl_sunny_1788205461324.jpg';

interface RealChildHeroCardProps {
  reducedMotion?: boolean;
  className?: string;
  onChildInteraction?: () => void;
  onTalkingStateChange?: (isTalking: boolean) => void;
}

const STORAGE_KEY_CUSTOM_HERO = 'wonder_meadow_custom_hero_photo';

export const RealChildHeroCard: React.FC<RealChildHeroCardProps> = ({
  reducedMotion = false,
  className = '',
  onChildInteraction,
  onTalkingStateChange
}) => {
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [isTapped, setIsTapped] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSpokenRef = useRef<number>(0);

  // Load custom user photo from localStorage if previously uploaded
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_HERO);
      if (saved) {
        setCustomPhotoUrl(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const photos = [
    {
      id: 'photo-meadow',
      src: customPhotoUrl || heroGirlMeadowPhoto,
      title: 'Meadow Explorer',
      badge: 'Classic Style'
    },
    {
      id: 'photo-blossom',
      src: customPhotoUrl || heroGirlBlossomPhoto,
      title: 'Blossom Artist',
      badge: 'Flower Style'
    },
    {
      id: 'photo-sunny',
      src: customPhotoUrl || heroGirlSunnyPhoto,
      title: 'Sunny Adventurer',
      badge: 'Outdoor Style'
    }
  ];

  const currentPhoto = photos[photoIndex % photos.length];

  const handleInteraction = () => {
    setIsTapped(true);
    setTapCount((prev) => prev + 1);

    const now = Date.now();
    if (now - lastSpokenRef.current > 2500) {
      lastSpokenRef.current = now;
      setIsTalking(true);
      if (onTalkingStateChange) onTalkingStateChange(true);
      
      audioService.playSparkle();
      audioService.speakCuteAnimeChild(
        "Hi! Welcome to Wonder Meadow! I'm so excited to learn and play with you!",
        true,
        () => {
          setIsTalking(false);
          if (onTalkingStateChange) onTalkingStateChange(false);
        }
      );
    } else {
      audioService.playPop();
    }

    if (onChildInteraction) {
      onChildInteraction();
    }

    setTimeout(() => {
      setIsTapped(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomPhotoUrl(result);
        try {
          localStorage.setItem(STORAGE_KEY_CUSTOM_HERO, result);
        } catch {
          // Local storage quota fallback
        }
        audioService.playSparkle();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPhotoUrl(null);
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_HERO);
    } catch {
      // ignore
    }
    audioService.playPop();
  };

  return (
    <div
      id="real-child-hero-card"
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
    >
      {/* Hidden file input for uploading real custom picture */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        aria-label="Upload custom photo"
      />

      {/* Main Photographic Card Container */}
      <div
        onClick={handleInteraction}
        className={`group relative w-full max-w-[320px] xs:max-w-[350px] sm:max-w-[390px] md:max-w-[420px] rounded-3xl p-3 sm:p-3.5 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.08)] hover:shadow-[0_16px_44px_rgba(15,23,42,0.12)] border border-slate-200/90 transition-all duration-300 cursor-pointer ${
          isTapped ? 'scale-102 ring-4 ring-teal-400/40' : 'hover:-translate-y-1'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Real photograph of child explorer with Down syndrome. Tap to hear a friendly greeting!"
        title="Tap to say hello!"
      >
        {/* Photographic Display Frame */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
          <img
            src={currentPhoto.src}
            alt="Real child with Down syndrome smiling warmly in Wonder Meadow"
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isTapped ? 'scale-105' : 'group-hover:scale-103'
            }`}
            referrerPolicy="no-referrer"
            loading="eager"
            draggable={false}
          />

          {/* Gentle Subtle Vignette & Gradient for Depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Left: Authentic Friend Badge */}
          <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>{currentPhoto.title}</span>
          </div>

          {/* Bottom Bar inside Photo: Tap to Speak hint */}
          <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <div className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
              <Volume2 className={`w-3.5 h-3.5 ${isTalking ? 'text-teal-600 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-[11px] tracking-wide">
                {isTalking ? 'Speaking...' : 'Tap to Say Hello'}
              </span>
            </div>

            {tapCount > 0 && (
              <div className="px-2 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                <Heart className="w-3 h-3 fill-white" />
                <span>{tapCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Card Controls & Actions */}
        <div className="mt-2.5 flex items-center justify-between px-1">
          {/* Photo Switcher / Toggle */}
          <div className="flex items-center gap-1.5">
            {!customPhotoUrl && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(0);
                    audioService.playPop();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    photoIndex === 0
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Meadow
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(1);
                    audioService.playPop();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    photoIndex === 1
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Blossom
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhotoIndex(2);
                    audioService.playPop();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                    photoIndex === 2
                      ? 'bg-teal-50 text-teal-700 border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Sunny
                </button>
              </>
            )}

            {customPhotoUrl && (
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-teal-600" />
                Custom Photo Active
              </span>
            )}
          </div>

          {/* Upload Custom Real Photo Button */}
          <div className="flex items-center gap-1.5">
            {customPhotoUrl && (
              <button
                type="button"
                onClick={handleResetPhoto}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline px-1 py-0.5"
                title="Reset to default authentic photo"
              >
                Reset
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 border border-slate-200 transition-colors"
              title="Upload your own picture"
            >
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>{customPhotoUrl ? 'Change' : 'Use My Photo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
