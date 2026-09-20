import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesProvider } from '@/services/googlePlacesProvider';
import { DemoPlacesProvider } from '@/services/demoProviders';

export async function POST(req: NextRequest) {
  try {
    const { location, types, radius, mode } = await req.json();

    const isDemo = mode === 'demo';
    const placesProvider = isDemo ? new DemoPlacesProvider() : new GooglePlacesProvider();

    const safeStops = await placesProvider.nearbySearch(location, types || ['gas_station', 'cafe', 'parking'], radius || 2000);

    return NextResponse.json({ safeStops });
  } catch (error) {
    console.error('Safe Stops API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch safe stops' }, { status: 500 });
  }
}
