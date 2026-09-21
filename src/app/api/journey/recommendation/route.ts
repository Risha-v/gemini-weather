import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import { GeminiRecommendation } from '@/domain/recommendation.types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const RecommendationZodSchema = z.object({
  recommendedRouteId: z.string(),
  headline: z.string(),
  explanation: z.string(),
  reasons: z.array(z.string()),
  userPreference: z.string(),
  evidenceReferences: z.array(z.string()),
  actions: z.array(z.string()),
  confidenceLabel: z.enum(['high', 'moderate', 'limited']),
  uncertainty: z.string(),
  voiceSummary: z.string(),
  advisoryOnly: z.boolean()
});

const recommendationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendedRouteId: { type: Type.STRING },
    headline: { type: Type.STRING },
    explanation: { type: Type.STRING },
    reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
    userPreference: { type: Type.STRING },
    evidenceReferences: { type: Type.ARRAY, items: { type: Type.STRING } },
    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
    confidenceLabel: { type: Type.STRING, description: "high, moderate, or limited" },
    uncertainty: { type: Type.STRING },
    voiceSummary: { type: Type.STRING },
    advisoryOnly: { type: Type.BOOLEAN },
  },
  required: [
    'recommendedRouteId', 'headline', 'explanation', 'reasons', 'userPreference', 
    'evidenceReferences', 'actions', 'confidenceLabel', 'uncertainty', 
    'voiceSummary', 'advisoryOnly'
  ]
};

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 501 });
  }

  try {
    const { journeyContext, userQuestion } = await req.json();

    const prompt = `
You are Gemini Weather Shield, a cautious mobility reasoning layer for Indian roads.

CRITICAL ANALYSIS RULES:
1. DO NOT recommend a route just because it has the shortest distance.
2. Calculate the average speed for each route: avgSpeed = (distanceMeters / 1000) / (durationSeconds / 3600) km/h.
3. A route with LOW average speed (< 30 km/h) likely has broken roads, muddy patches, congestion, or poor infrastructure.
4. A route with HIGH average speed (> 50 km/h) likely uses an expressway, National Highway, or well-constructed highway.
5. Example: A 5km route at 5 km/h avg speed (60 min) is WORSE than a 7.5km route at 60 km/h avg speed (7.5 min) because the shorter route has terrible road conditions.
6. Factor in: road quality (inferred from avg speed), weather exposure along route, expected rain/storm segments, traffic conditions, total travel time.
7. Explain WHY you chose the route — mention avg speed, road quality inference, weather exposure trade-offs.
8. Never guarantee safety. Never instruct a rider to interact with a screen while moving.
9. If conditions are severe, prioritize a reachable safe stop.

Available route data for each route includes: id, label, distanceMeters, durationSeconds, routeLabels, weatherSegments (with condition, precipitationProbability, windKph, visibilityKm, temperatureC), and exposure summary.

Journey Context:
${JSON.stringify(journeyContext, null, 2)}

User Question: ${userQuestion || 'Which route should I take and why?'}
    `;

    let response;
    let lastError;
    const delays = [2000, 5000, 10000];
    
    for (let attempt = 0; attempt <= 2; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: recommendationSchema,
          }
        });
        break; // Success, exit loop
      } catch (err: any) {
        lastError = err;
        if (attempt < 2 && (err?.status === 429 || err?.status === 503)) {
          await new Promise(r => setTimeout(r, delays[attempt]));
          continue;
        }
        throw err;
      }
    }
    
    if (!response) throw lastError || new Error('Failed after retries');

    if (!response.text) {
      throw new Error("No response text");
    }

    const parsedJson = JSON.parse(response.text);
    
    // Validate with Zod
    const validatedData = RecommendationZodSchema.parse(parsedJson);

    const data: GeminiRecommendation = {
      ...validatedData,
      generatedAt: Date.now()
    };

    return NextResponse.json({ recommendation: data });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: 'Failed to generate recommendation' }, { status: 500 });
  }
}
