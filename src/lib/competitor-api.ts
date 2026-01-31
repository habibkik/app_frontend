import { supabase } from '@/integrations/supabase/client';

export interface CompetitorAnalysis {
  name: string;
  website: string;
  summary: string;
  products: string[];
  pricing: {
    strategy: string;
    range: string;
    competitiveness: string;
  };
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
  recommendations: string[];
}

export interface AnalysisResponse {
  success: boolean;
  data?: CompetitorAnalysis;
  error?: string;
}

export async function analyzeCompetitor(websiteUrl: string, competitorName?: string): Promise<AnalysisResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('competitor-analysis', {
      body: { websiteUrl, competitorName },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: error.message };
    }

    return data as AnalysisResponse;
  } catch (err) {
    console.error('Error calling competitor analysis:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to analyze competitor' 
    };
  }
}
