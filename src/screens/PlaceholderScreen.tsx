import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenHeader, ScreenContainer } from '@/components/base';
import type { RootStackParamList } from '@/types/navigation';
import { screenTitleMap } from '@/navigation/screenRegistry';

type Props = NativeStackScreenProps<RootStackParamList, keyof RootStackParamList>;

export function PlaceholderScreen({ route }: Props) {
  const title = screenTitleMap[route.name];

  return (
    <ScreenContainer>
      <ScreenHeader title={title} />
    </ScreenContainer>
  );
}
