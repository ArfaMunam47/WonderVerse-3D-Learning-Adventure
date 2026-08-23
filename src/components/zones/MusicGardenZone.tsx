import React from 'react';
import { MusicBellsZone } from './MusicBellsZone';

interface MusicGardenZoneProps {
  onEarnStar: () => void;
  onBack: () => void;
}

export const MusicGardenZone: React.FC<MusicGardenZoneProps> = (props) => {
  return <MusicBellsZone {...props} />;
};
