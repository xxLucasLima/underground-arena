import { PropsWithChildren, useEffect, useState } from 'react';
import { initializeDatabase } from '@/database/init';

export function AppBootstrap({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      await initializeDatabase();
      setReady(true);
    }

    bootstrap();
  }, []);

  if (!ready) return null;

  return children;
}
