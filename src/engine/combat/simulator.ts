import type { CombatConfig, FighterProfile } from './types';
import { runMatch } from './engine';

export type SimulationResult = {
  wins: number;
  losses: number;
  draws: number;
  totalTurns: number;
};

export function simulateMatches(args: {
  seedBase: number;
  matches: number;
  playerProfile: FighterProfile;
  opponentProfile: FighterProfile;
  config?: CombatConfig;
}): SimulationResult {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let totalTurns = 0;
  for (let i = 0; i < args.matches; i += 1) {
    const state = runMatch({
      seed: args.seedBase + i,
      playerProfile: args.playerProfile,
      opponentProfile: args.opponentProfile,
      config: args.config,
    });
    totalTurns += state.turn;
    if (!state.winnerId) draws += 1;
    else if (state.winnerId === args.playerProfile.id) wins += 1;
    else losses += 1;
  }
  return { wins, losses, draws, totalTurns };
}
