"use client";

import dynamic from 'next/dynamic';
import { JourneyProvider } from '@/state/JourneyContext';

const WeatherShieldClient = dynamic(
  () => import('@/components/weather-shield/WeatherShieldClient'),
  { ssr: false }
);

export default function Page() {
  return (
    <JourneyProvider>
      <WeatherShieldClient />
    </JourneyProvider>
  );
}
