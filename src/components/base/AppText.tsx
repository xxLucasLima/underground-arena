import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { theme } from '@/themes';

type AppTextProps = PropsWithChildren<{ style?: StyleProp<TextStyle> }>;

export function AppText({ children, style }: AppTextProps) {
  return <Text style={[styles.text, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
});
