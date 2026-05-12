import { StatusBar } from 'expo-status-bar';
import { AppBootstrap } from '@/app/AppBootstrap';
import { AppNavigation } from '@/navigation/AppNavigation';

export default function App() {
  return (
    <AppBootstrap>
      <StatusBar style="light" />
      <AppNavigation />
    </AppBootstrap>
  );
}
