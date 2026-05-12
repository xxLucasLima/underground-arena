export type LeagueId =
  | 'amateur'
  | 'underground'
  | 'regional'
  | 'national'
  | 'elite'
  | 'world';

export type LeagueDefinition = {
  id: LeagueId;
  name: string;
  unlockLevel: number;
  xpMultiplier: number;
  coinMultiplier: number;
  opponentPowerRange: [number, number];
};

export const LEAGUES: LeagueDefinition[] = [
  { id: 'amateur',     name: 'Amateur Circuit',           unlockLevel: 1,  xpMultiplier: 1.0, coinMultiplier: 1.0, opponentPowerRange: [40, 55] },
  { id: 'underground', name: 'Underground Cage',          unlockLevel: 5,  xpMultiplier: 1.2, coinMultiplier: 1.15, opponentPowerRange: [55, 70] },
  { id: 'regional',    name: 'Regional League',           unlockLevel: 12, xpMultiplier: 1.4, coinMultiplier: 1.3, opponentPowerRange: [70, 85] },
  { id: 'national',    name: 'National League',           unlockLevel: 22, xpMultiplier: 1.7, coinMultiplier: 1.5, opponentPowerRange: [85, 100] },
  { id: 'elite',       name: 'Elite Combat Federation',   unlockLevel: 35, xpMultiplier: 2.0, coinMultiplier: 1.75, opponentPowerRange: [100, 115] },
  { id: 'world',       name: 'World Championship',        unlockLevel: 50, xpMultiplier: 2.4, coinMultiplier: 2.0, opponentPowerRange: [115, 140] },
];
