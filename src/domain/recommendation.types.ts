export interface GeminiRecommendation {
  summary: string;
  recommendation: string;
  reasonCodes: string[];
  tradeoffs: string[];
  uncertainty: string;
  actions: string[];
  voiceSummary: string;
  confidenceLabel: string;
  generatedAt: number;
}
