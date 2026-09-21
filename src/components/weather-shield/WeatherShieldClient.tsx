'use client';

import React from 'react';
import GoogleMapsProvider from '@/components/providers/GoogleMapsProvider';
import AppShell from './AppShell';

export default function WeatherShieldClient() {
  return (
    <GoogleMapsProvider>
      <AppShell />
    </GoogleMapsProvider>
  );
}
