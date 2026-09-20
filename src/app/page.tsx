import { JourneyProvider } from '@/state/JourneyContext';
import AppShell from '@/components/weather-shield/AppShell';

export default function Home() {
  return (
    <JourneyProvider>
      <AppShell />
    </JourneyProvider>
  );
}
