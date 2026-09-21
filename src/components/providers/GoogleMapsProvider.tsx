'use client';

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

type Props = {
  children: React.ReactNode;
};

export default function GoogleMapsProvider({
  children,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={apiKey ?? ''} version="beta" onLoad={() => console.log('Maps API Loaded')}>
      {children}
    </APIProvider>
  );
}
