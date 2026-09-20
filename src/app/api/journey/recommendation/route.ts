import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { z } from 'zod';
import { GeminiRecommendation } from '@/domain/recommendation.types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const RecommendationZodSchema = z.object({
  summary: z.string(),
  recommendation: z.string(),
  reasonCodes: z.array(z.string()),
  tradeoffs: z.array(z.string()),
  uncertainty: z.string(),
  actions: z.array(z.string()),
  voiceSummary: z.string(),
  confidenceLabel: z.string(),
});

const recommendationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    recommendation: { type: Type.STRING },
    reasonCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
    tradeoffs: { type: Type.ARRAY, items: { type: Type.STRING } },
    uncertainty: { type: Type.STRING },
    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
    voiceSummary: { type: Type.STRING },
    confidenceLabel: { type: Type.STRING },
  },
  required: ['summary', 'recommendation', 'reasonCodes', 'tradeoffs', 'uncertainty', 'actions', 'voiceSummary', 'confidenceLabel']
};

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 501 });
  }

  try {
    const { journeyContext, userQuestion } = await req.json();

    const prompt = `
You are Gemini Weather Shield, a cautious mobility reasoning layer. You do not invent weather, route, traffic, or hazard facts. 
Use only the supplied structured inputs. Distinguish observations, forecasts, and estimates. 
Explain trade-offs in concise natural language. Never guarantee safety. 
Never instruct a rider to interact with a screen while moving. 
If conditions are severe, prioritize a reachable safe stop. Respect the user's travel preference.
Return the exact requested JSON schema.

Journey Context:
${JSON.stringify(journeyContext, null, 2)}

User Question: ${userQuestion || 'Should I leave now?'}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: recommendationSchema,
      }
    });

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
