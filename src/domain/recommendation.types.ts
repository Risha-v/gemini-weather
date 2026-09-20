export interface GeminiRecommendation {
  recommendedRouteId: string;
  headline: string;
  explanation: string;
  reasons: string[];
  userPreference: string;
  evidenceReferences: string[];
  actions: string[];
  confidenceLabel: 'high' | 'moderate' | 'limited';
  uncertainty: string;
  voiceSummary: string;
  advisoryOnly: boolean;
  generatedAt: number;
}
