import { NextRequest, NextResponse } from 'next/server';
import { GoogleWeatherProvider } from '@/services/googleWeatherProvider';
import { DemoWeatherProvider } from '@/services/demoProviders';

export async function POST(req: NextRequest) {
  try {
    const { lat, lng, mode } = await req.json();

    const isDemo = mode === 'demo';
    const weatherProvider = isDemo ? new DemoWeatherProvider() : new GoogleWeatherProvider();

    const forecast = await weatherProvider.getForecast(lat, lng);

    return NextResponse.json({ forecast });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather forecast' }, { status: 500 });
  }
}
