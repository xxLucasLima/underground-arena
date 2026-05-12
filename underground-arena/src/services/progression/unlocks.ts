import { LEAGUES, type LeagueId } from '@/data/progression/leagues';

export function getUnlockedLeagues(level: number): LeagueId[] {
  return LEAGUES.filter((l) => l.unlockLevel <= level).map((l) => l.id);
}

export function getNextLeagueUnlock(level: number) {
  return LEAGUES.find((l) => l.unlockLevel > level) ?? null;
}

export function isLeagueAvailable(level: number, leagueId: LeagueId): boolean {
  return getUnlockedLeagues(level).includes(leagueId);
}
