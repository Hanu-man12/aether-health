import React from 'react';

export enum ElementType {
  FIRE = 'FIRE',
  EARTH = 'EARTH',
  WATER = 'WATER',
  AIR = 'AIR',
  SPACE = 'SPACE'
}

export interface ElementConfig {
  id: ElementType;
  name: string;
  tagline: string;
  description: string;
  
  // Styling
  gradientFrom: string;
  gradientTo: string;
  textAccent: string;
  bg: string;
  color: string;
  
  icon: React.FC<any>;
  inputType: 'text' | 'image' | 'mock_action';
  placeholder?: string;
}

// Structure for the JSON response from Gemini
export interface AnalysisResult {
  // Fire
  emotionalState?: string;
  likelyCauses?: Array<{ cause: string; probability: string }>;
  
  // Earth
  medicineIdentified?: string;
  authenticityConfidence?: string;
  redFlags?: string[];
  
  // Water
  waterQualityRisk?: 'Low' | 'Moderate' | 'High';
  reportSummary?: string;

  // Air
  ocrInterpretation?: string;
  ambiguityFlags?: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    confidence: 'High' | 'Medium' | 'Low';
  }>;
  graphologyAnalysis?: Array<{ // New field for handwriting analysis
    observedStroke: string;
    interpretedAs: string;
    confidence: string;
    strokePressure?: string;
    slant?: string;
  }>;
  verificationRequired?: boolean;

  // Space (LifeLoop Dashboard)
  localizedExplanation?: string; // Legacy field, kept for compatibility
  culturalNotes?: string;
  
  // New Space Dashboard Fields
  dashboardContext?: string; // "What this means for you"
  actionableTips?: string[]; // "What you can do today"
  wellnessStrip?: Array<{
    title: string;
    type: 'Breathing' | 'Movement' | 'Sleep' | 'Nutrition' | 'Mindfulness';
    instruction: string;
  }>;
  newsFeed?: Array<{
    headline: string;
    summary: string;
    source: string;
    relevance: string;
  }>;
  
  // Common
  wellnessSuggestions?: string[]; // Legacy, map to tips if needed
  reasoningSummary: string; // For Trust Panel
  safetyAdvice: string; // "When to seek help" or "Safety Advice"
  reassuranceLine: string; // The closing supportive line
  whatThisMeans?: string; // General explanation
}

export interface IntentResult {
  action: 'NAVIGATE_ELEMENT' | 'NAVIGATE_DASHBOARD' | 'EXPLAIN';
  targetElement?: ElementType;
  reasoning: string;
}

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'hi' | 'bn';
export type Tone = 'calm' | 'neutral' | 'supportive';
export type HealthStatus = 'calm' | 'active' | 'focused';

export interface UserProfile {
  name: string;
  language: Language;
  tone: Tone;
  status: HealthStatus;
  voiceResponse: boolean;
  accessibility: {
    largeText: boolean;
  };
}