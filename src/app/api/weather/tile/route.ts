import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const z = url.searchParams.get('z');
  const x = url.searchParams.get('x');
  const y = url.searchParams.get('y');
  const field = url.searchParams.get('field') || 'precipitationIntensity';
  const timestamp = url.searchParams.get('time') || 'now';

  // Strict validation to prevent abuse of the proxy
  const validFields = ['precipitationIntensity', 'windSpeed', 'pressureSeaLevel', 'temperature', 'cloudCover', 'visibility'];
  if (!validFields.includes(field)) {
    return new NextResponse('Invalid field requested', { status: 400 });
  }

  if (!z || !x || !y) {
    return new NextResponse('Missing tile coordinates', { status: 400 });
  }

  // Validate z, x, y are numbers
  if (isNaN(Number(z)) || isNaN(Number(x)) || isNaN(Number(y))) {
    return new NextResponse('Invalid tile coordinates', { status: 400 });
  }

  const isDemo = process.env.NEXT_PUBLIC_APP_MODE === 'demo';
  
  if (isDemo) {
    // In demo mode, we could return a transparent PNG or a demo tile
    // For now, return a 1x1 transparent PNG
    const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      }
    });
  }

  const apiKey = process.env.TOMORROW_API_KEY;
  if (!apiKey) {
    return new NextResponse('API Key not configured', { status: 500 });
  }

  // Tomorrow.io v4 tile URL format
  // https://api.tomorrow.io/v4/map/tile/{z}/{x}/{y}/{field}/now.png?apikey=KEY
  const tileUrl = `https://api.tomorrow.io/v4/map/tile/${z}/${x}/${y}/${field}/${timestamp}.png?apikey=${apiKey}`;

  try {
    const response = await fetch(tileUrl);
    
    if (!response.ok) {
      console.error('Failed to fetch Tomorrow.io tile:', response.statusText);
      return new NextResponse('Failed to fetch tile', { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=3600',
      }
    });
  } catch (err) {
    console.error('Tile proxy error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
