import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';

type EnergyBarProps = {
  current: number;
  max: number;
};

export function EnergyBar({ current, max }: EnergyBarProps) {
  const progress = max <= 0 ? 0 : current / max;

  return (
    <>
      <AppText>{`Energy ${current}/${max}`}</AppText>
      <ProgressBar progress={progress} />
    </>
  );
}
