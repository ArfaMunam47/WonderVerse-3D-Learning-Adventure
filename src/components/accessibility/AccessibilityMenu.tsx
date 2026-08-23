import React from 'react';
import { AccessibilitySettings } from '../../types';
import { audioService } from '../../utils/audio';
import { 
  X, 
  Eye, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Activity, 
  Sparkles, 
  Type, 
  MousePointer, 
  Check 
} from 'lucide-react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof AccessibilitySettings) => {
    audioService.playPop();
    const updated = !settings[key];
    onUpdateSettings({ [key]: updated });
  };

  return (
    <div
      id="accessibility-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-title"
    >
      <div className="relative w-full max-w-lg bg-[#FFFDF7] rounded-3xl shadow-2xl border-2 border-purple-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 bg-purple-100/60 border-b border-purple-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h3 id="accessibility-title" className="text-xl font-display font-black text-stone-900">
                Accessibility & Comfort
              </h3>
              <p className="text-xs text-purple-900 font-bold">
                Adjust Wonder Meadow for your child's needs
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center shadow-xs border border-stone-200 cursor-pointer"
            aria-label="Close Accessibility Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="p-4 md:p-6 space-y-4 overflow-y-auto bg-[#FAF8F5]">
          {/* 1. Voice Narration */}
          <div className="flex items-center justify-between p-3.5 bg-[#FFFDF7] rounded-2xl border border-purple-200 shadow-xs">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-extrabold text-sm text-stone-900">Voice Read-Aloud Narration</div>
                <div className="text-xs text-stone-600 font-medium">Speaks letters, numbers, words, and stories out loud</div>
              </div>
            </div>
            <button
              onClick={() => toggle('narrationEnabled')}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                settings.narrationEnabled ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.narrationEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Sound Effects & Music */}
          <div className="flex items-center justify-between p-3.5 bg-[#FFFDF7] rounded-2xl border border-purple-200 shadow-xs">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-purple-600" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
              <div>
                <div className="font-extrabold text-sm text-stone-900">Audio & Chime Effects</div>
                <div className="text-xs text-stone-600 font-medium">Plays friendly bells, pops, and celebration sounds</div>
              </div>
            </div>
            <button
              onClick={() => toggle('soundEnabled')}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                settings.soundEnabled ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Reduced Motion */}
          <div className="flex items-center justify-between p-3.5 bg-[#FFFDF7] rounded-2xl border border-purple-200 shadow-xs">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-extrabold text-sm text-stone-900">Reduced Motion</div>
                <div className="text-xs text-stone-600 font-medium">Smoothes camera movements and stops rapid bouncing</div>
              </div>
            </div>
            <button
              onClick={() => toggle('reducedMotion')}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                settings.reducedMotion ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 4. High Contrast Mode */}
          <div className="flex items-center justify-between p-3.5 bg-[#FFFDF7] rounded-2xl border border-purple-200 shadow-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-extrabold text-sm text-stone-900">High Contrast Visuals</div>
                <div className="text-xs text-stone-600 font-medium">Enforces bold borders and maximum contrast for text</div>
              </div>
            </div>
            <button
              onClick={() => toggle('highContrast')}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                settings.highContrast ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.highContrast ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Large Text & Readability */}
          <div className="flex items-center justify-between p-3.5 bg-[#FFFDF7] rounded-2xl border border-purple-200 shadow-xs">
            <div className="flex items-center gap-3">
              <Type className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-extrabold text-sm text-stone-900">Large & Clear Text</div>
                <div className="text-xs text-stone-600 font-medium">Increases letter spacing and reading clarity</div>
              </div>
            </div>
            <button
              onClick={() => toggle('dyslexicFont')}
              className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${
                settings.dyslexicFont ? 'bg-purple-600' : 'bg-stone-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                  settings.dyslexicFont ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Done Button */}
        <div className="p-4 bg-[#FFFDF7] border-t border-purple-200/60 flex justify-end">
          <button
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-extrabold text-sm shadow-md cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
