export const ECONOMY_CONFIG = {
  startingCoins: 200,
  startingGems: 0,
  fightBaseCoins: 50,
  fightWinBonus: 60,
  fightKoBonus: 30,
  fightSubmissionBonus: 25,
  fightFlawlessBonus: 40,
  fightStreakStep: 10, // +10 coins per streak tier
  maxStreakBonusTiers: 5,
  dailyLoginBaseCoins: 100,
  dailyStreakStep: 25,
  dailyMaxStreakDays: 7,
} as const;
