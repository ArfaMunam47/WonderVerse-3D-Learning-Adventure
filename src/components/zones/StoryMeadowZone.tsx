import React from 'react';
import { StoryPavilionZone } from './StoryPavilionZone';

interface StoryMeadowZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

export const StoryMeadowZone: React.FC<StoryMeadowZoneProps> = (props) => {
  return <StoryPavilionZone {...props} />;
};
