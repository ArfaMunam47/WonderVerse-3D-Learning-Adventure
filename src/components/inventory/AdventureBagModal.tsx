import React, { useState } from 'react';
import { audioService } from '../../utils/audio';
import {
  X,
  Sparkles,
  Star,
  CheckCircle2,
  Package,
  Award,
  Heart,
  Volume2
} from 'lucide-react';

export interface BagItemDetail {
  id: string;
  name: string;
  count: number;
  icon: string;
  description: string;
  soundType: 'pop' | 'sparkle' | 'chime';
  bgColor: string;
  borderColor: string;
  textColor: string;
}

interface AdventureBagModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  gems: number;
  clovers: number;
  stars: number;
  fruits?: number;
  badges?: string[];
  characterName?: string;
  characterEmoji?: string;
}

export const AdventureBagModal: React.FC<AdventureBagModalProps> = ({
  isOpen,
  onClose,
  coins = 0,
  gems = 0,
  clovers = 0,
  stars = 0,
  fruits = Math.floor(coins / 3) + 2,
  badges = [],
  characterName = 'Explorer',
  characterEmoji = '🎒'
}) => {
  const [tappedItemId, setTappedItemId] = useState<string | null>(null);
  const [itemMessage, setItemMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const bagItems: BagItemDetail[] = [
    {
      id: 'coins',
      name: 'Meadow Gold Coins',
      count: coins,
      icon: '🪙',
      description: 'Shiny golden coins gathered along the cobblestone road!',
      soundType: 'pop',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-900'
    },
    {
      id: 'stars',
      name: 'Wonder Stars',
      count: stars,
      icon: '⭐',
      description: 'Luminous stars earned by discovering learning stations!',
      soundType: 'sparkle',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      textColor: 'text-yellow-900'
    },
    {
      id: 'fruits',
      name: 'Sweet Meadow Berries',
      count: Math.max(fruits, 1),
      icon: '🍓',
      description: 'Fresh juicy wild strawberries picked from the orchard!',
      soundType: 'pop',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-300',
      textColor: 'text-rose-900'
    },
    {
      id: 'gems',
      name: 'Rainbow Star Crystals',
      count: gems,
      icon: '💎',
      description: 'Sparkling gemstones hidden near crystal fountains!',
      soundType: 'chime',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-300',
      textColor: 'text-sky-900'
    },
    {
      id: 'clovers',
      name: 'Four-Leaf Clovers',
      count: clovers,
      icon: '🍀',
      description: 'Lucky green clovers bringing joy and good fortune!',
      soundType: 'pop',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300',
      textColor: 'text-emerald-900'
    }
  ];

  const roadBadges = [
    { id: 'bunny_badge', name: 'Golden Carrot', icon: '🥕', desc: 'Saved the sleeping bunny on the path!', unlocked: badges.includes('blockage_bunny') || coins >= 5 },
    { id: 'log_badge', name: 'Rainbow Blossom', icon: '🌸', desc: 'Bloomed the magical mossy log!', unlocked: badges.includes('blockage_log') || stars >= 2 },
    { id: 'duck_badge', name: 'Lucky Feather', icon: '🦆', desc: 'Helped the ducklings cross the stream!', unlocked: badges.includes('blockage_ducklings') || clovers >= 1 },
    { id: 'gate_badge', name: 'Melody Star Key', icon: '🔑', desc: 'Unlocked the golden music gate!', unlocked: badges.includes('blockage_gate') || gems >= 1 }
  ];

  const handleTapItem = (item: BagItemDetail) => {
    setTappedItemId(item.id);
    if (item.soundType === 'sparkle') audioService.playSparkle();
    else audioService.playPop();
    setItemMessage(`✨ ${item.name}: ${item.description}`);
    setTimeout(() => setTappedItemId(null), 700);
  };

  const handleTapBadge = (badge: { name: string; desc: string; icon: string; unlocked: boolean }) => {
    if (badge.unlocked) {
      audioService.playSparkle();
      setItemMessage(`🏆 ${badge.name}: ${badge.desc}`);
    } else {
      audioService.playPop();
      setItemMessage(`🔒 ${badge.name}: Explore the path to find this adventure souvenir!`);
    }
  };

  const totalItems = coins + gems + clovers + stars + Math.max(fruits, 1);

  return (
    <div
      id="adventure-bag-inventory-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/60 backdrop-blur-xs select-none animate-in fade-in zoom-in-95"
      role="dialog"
      aria-labelledby="bag-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-[#FFFDF7] rounded-3xl md:rounded-4xl border-3 border-amber-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <header className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 p-4 sm:p-5 border-b-2 border-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-md border-2 border-amber-400 flex items-center justify-center text-2xl animate-bounce">
              🎒
            </div>
            <div>
              <h2 id="bag-modal-title" className="text-xl sm:text-2xl font-display font-black text-stone-900 leading-tight flex items-center gap-2">
                <span>{characterName}’s Adventure Bag</span>
                <Sparkles className="w-5 h-5 text-amber-600 fill-amber-500" />
              </h2>
              <p className="text-xs sm:text-sm font-bold text-amber-950/80">
                {totalItems} total meadow treasures collected in your bag!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="w-10 h-10 rounded-2xl bg-white/90 hover:bg-white text-stone-800 flex items-center justify-center border-2 border-amber-400 shadow-sm cursor-pointer active:scale-95 transition-all"
            aria-label="Close Adventure Bag"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>
        </header>

        {/* Scrollable Goodie Inventory Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Active Item Toast Notice */}
          {itemMessage && (
            <div className="p-3 rounded-2xl bg-amber-100/90 border-2 border-amber-300 text-stone-900 font-bold text-xs sm:text-sm text-center animate-in fade-in">
              {itemMessage}
            </div>
          )}

          {/* 1. Collected Goodies Grid */}
          <div>
            <h3 className="text-sm font-display font-black text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Collected Goodies & Coins</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bagItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTapItem(item)}
                  className={`p-3.5 rounded-2xl border-2 ${item.bgColor} ${item.borderColor} ${item.textColor} flex items-center justify-between gap-3 text-left transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95 ${
                    tappedItemId === item.id ? 'ring-4 ring-amber-400/50 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-stone-200 flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-display font-black text-sm sm:text-base leading-tight">
                        {item.name}
                      </div>
                      <div className="text-xs opacity-75 font-semibold mt-0.5 line-clamp-1">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="text-xl sm:text-2xl font-display font-black px-3 py-1 bg-white/90 rounded-xl border border-stone-200 shadow-xs">
                    {item.count}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Adventure Road Souvenirs & Badges */}
          <div>
            <h3 className="text-sm font-display font-black text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Trail Souvenirs & Road Badges</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roadBadges.map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => handleTapBadge(badge)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
                    badge.unlocked
                      ? 'bg-amber-50 border-amber-300 text-stone-900 hover:bg-amber-100/80'
                      : 'bg-stone-100 border-stone-200 text-stone-400 opacity-60'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-white shadow-xs flex items-center justify-center text-2xl">
                    {badge.unlocked ? badge.icon : '🔒'}
                  </div>
                  <div className="font-display font-black text-xs leading-tight">
                    {badge.name}
                  </div>
                  <div className="text-[10px] font-semibold leading-tight line-clamp-2">
                    {badge.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <footer className="p-4 sm:p-5 bg-stone-50 border-t-2 border-stone-200 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-600 font-bold flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-400" />
            <span>Treasures stay safely in your bag!</span>
          </div>

          <button
            type="button"
            onClick={() => {
              audioService.playPop();
              onClose();
            }}
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm shadow-md cursor-pointer active:scale-95 transition-all"
          >
            Keep Exploring!
          </button>
        </footer>
      </div>
    </div>
  );
};
