import { Modal, StyleSheet, View } from 'react-native';
import { PropsWithChildren } from 'react';
import { theme } from '@/themes';

type AppModalProps = PropsWithChildren<{ visible: boolean; onRequestClose: () => void }>;

export function AppModal({ visible, onRequestClose, children }: AppModalProps) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.backdrop}>
        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
  },
});
