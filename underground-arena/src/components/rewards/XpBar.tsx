import { View } from 'react-native';
import { AppText, ProgressBar } from '@/components/base';
import { theme } from '@/themes';
import { xpToNextLevel } from '@/services/progression/xp';

type XpBarProps = {
  level: number;
  xp: number;
};

/**
 * Level + XP-to-next display. Drives the animated `ProgressBar`, which fills
 * smoothly when the parent re-renders with a new XP value (post-fight).
 */
export function XpBar({ level, xp }: XpBarProps) {
  const next = xpToNextLevel(level);
  const progress = next > 0 ? xp / next : 0;
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText size="caption" tone="muted" uppercase>{`Level ${level}`}</AppText>
        <AppText size="caption" tone="muted">{`${xp} / ${next}`}</AppText>
      </View>
      <ProgressBar progress={progress} color={theme.colors.gold} trailColor={'#2C2410'} height={8} />
    </View>
  );
}
