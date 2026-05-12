import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FloatingNumber } from './FloatingNumber';

type Item = { id: number; value: number; jitter: number; critical: boolean };

let _id = 0;

/**
 * Anchor layer that holds zero-or-more `FloatingNumber` siblings and recycles
 * them as they finish. Imperative `spawn` API keeps render churn off the
 * parent screen.
 */
export function useFloatingNumberLayer() {
  const [items, setItems] = useState<Item[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const spawn = useCallback(
    (value: number, opts?: { critical?: boolean }) => {
      const id = ++_id;
      const jitter = (Math.random() - 0.5) * 36;
      setItems((prev) => [...prev, { id, value, jitter, critical: !!opts?.critical }]);
    },
    [],
  );

  const layer = (
    <View pointerEvents="none" style={styles.layer}>
      {items.map((i) => (
        <FloatingNumber
          key={i.id}
          value={i.value}
          jitter={i.jitter}
          critical={i.critical}
          onDone={() => remove(i.id)}
        />
      ))}
    </View>
  );

  return { layer, spawn };
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
});
