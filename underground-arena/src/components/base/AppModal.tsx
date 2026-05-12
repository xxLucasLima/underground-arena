import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { PropsWithChildren } from 'react';
import { theme } from '@/themes';
import { motion } from '@/themes/motion';
import { useReducedMotion } from '@/animations/hooks/useReducedMotion';

type AppModalProps = PropsWithChildren<{
  visible: boolean;
  onRequestClose: () => void;
  /** Tapping the backdrop dismisses. Default true. */
  dismissOnBackdrop?: boolean;
}>;

/**
 * Animated modal: fades the backdrop, scales the content card in with a
 * bouncy reveal. Honors reduced-motion (snap to final state).
 */
export function AppModal({ visible, onRequestClose, dismissOnBackdrop = true, children }: AppModalProps) {
  const bg = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!visible) return;
    if (reduced) {
      bg.setValue(1);
      scale.setValue(1);
      return;
    }
    bg.setValue(0);
    scale.setValue(0.92);
    Animated.parallel([
      Animated.timing(bg, {
        toValue: 1,
        duration: motion.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.duration.normal,
        easing: motion.easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, bg, scale, reduced]);

  return (
    <Modal transparent visible={visible} onRequestClose={onRequestClose} animationType="none">
      <Animated.View style={[styles.backdrop, { opacity: bg }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismissOnBackdrop ? onRequestClose : undefined}
        />
        <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
          <View style={styles.contentInner}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 420,
  },
  contentInner: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    padding: theme.spacing.lg,
    ...theme.shadows.hero,
  },
});
