import React from 'react';
import { StarObservatoryZone } from './StarObservatoryZone';

interface StarMeadowZoneProps {
  stars?: number;
  totalStars?: number;
  onEarnStar: () => void;
  onBack: () => void;
}

export const StarMeadowZone: React.FC<StarMeadowZoneProps> = ({
  stars = 0,
  totalStars,
  onEarnStar,
  onBack
}) => {
  return (
    <StarObservatoryZone
      totalStars={totalStars ?? stars}
      onEarnStar={onEarnStar}
      onBack={onBack}
    />
  );
};
