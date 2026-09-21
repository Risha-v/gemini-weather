'use client';

import React from 'react';
import GoogleMapsProvider from '@/components/providers/GoogleMapsProvider';
// import AppShell from './AppShell'; // Temporarily disabled for diagnostic
import GooglePlacesDiagnostic from '@/components/search/GooglePlacesDiagnostic';

export default function WeatherShieldClient() {
  return (
    <GoogleMapsProvider>
      {/* <AppShell /> */}
      <GooglePlacesDiagnostic />
    </GoogleMapsProvider>
  );
}
