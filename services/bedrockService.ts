/**
 * bedrockService.ts
 * Replaces geminiService.ts - calls AWS Lambda functions backed by Bedrock Nova Lite.
 * Lambda URLs are loaded from amplify_outputs.json after sandbox deploy.
 */

import { ElementType, AnalysisResult, UserProfile, IntentResult } from '../types';

// ─── Lambda Endpoint Config ───────────────────────────────────────────────────
// These URLs are populated after `npx ampx sandbox` completes.
// They come from the Amplify outputs or can be hardcoded after first deploy.
let LAMBDA_URLS: Record<string, string> = {};

export const configureLambdaUrls = (urls: Record<string, string>) => {
  LAMBDA_URLS = urls;
};

const callLambda = async (url: string, body: object): Promise<any> => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Lambda error: ${res.status}`);
  return res.json();
};

// ─── Logo (static fallback - no Gemini image gen needed) ─────────────────────
const FALLBACK_LOGO =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQxIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiIGZ4PSI1MCUiIGZ5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODU0ZDBlO3N0b3Atb3BhY2l0eToxIiAvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjMGUxMjE4IiAvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjUwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ3JhZDEpIiBzdHJva2Utd2lkdGg9IjQiIC8+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZDEpIiBvcGFjaXR5PSIwLjgiIC8+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIxNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMiIgLz48L3N2Zz4=';

export const generateAppLogo = async (): Promise<string | undefined> => {
  return FALLBACK_LOGO;
};

// ─── Voice Intent Routing (Bedrock via Lambda or local fallback) ──────────────
export const routeVoiceIntent = async (
  text: string,
  userProfile: UserProfile
): Promise<IntentResult> => {
  // Simple keyword-based routing as fallback when Lambda URL not set
  // Replace with a dedicated Lambda if needed
  const lower = text.toLowerCase();
  if (lower.includes('symptom') || lower.includes('pain') || lower.includes('sick') || lower.includes('fever')) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.FIRE, reasoning: 'Symptom keywords detected' };
  }
  if (lower.includes('medicine') || lower.includes('pill') || lower.includes('tablet') || lower.includes('packaging')) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.EARTH, reasoning: 'Medicine keywords detected' };
  }
  if (lower.includes('water') || lower.includes('drink') || lower.includes('quality')) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.WATER, reasoning: 'Water keywords detected' };
  }
  if (lower.includes('prescription') || lower.includes('doctor') || lower.includes('script') || lower.includes('dosage')) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.AIR, reasoning: 'Prescription keywords detected' };
  }
  if (lower.includes('back') || lower.includes('home') || lower.includes('dashboard') || lower.includes('menu')) {
    return { action: 'NAVIGATE_DASHBOARD', reasoning: 'Navigation keywords detected' };
  }
  if (lower.includes('help') || lower.includes('what') || lower.includes('how') || lower.includes('explain')) {
    return { action: 'EXPLAIN', reasoning: 'Help request detected' };
  }
  return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.SPACE, reasoning: 'Default to LifeLoop' };
};

// ─── AI Buddy Response ────────────────────────────────────────────────────────
export const getBuddyResponse = async (
  query: string,
  _userProfile: UserProfile
): Promise<string> => {
  const lower = query.toLowerCase();
  if (lower.includes('vitalscan') || lower.includes('fire') || lower.includes('symptom')) {
    return "VitalScan (Fire) analyzes your symptoms using AI to reduce anxiety and suggest likely causes.";
  }
  if (lower.includes('truemeds') || lower.includes('earth') || lower.includes('medicine')) {
    return "TrueMeds (Earth) verifies medicine packaging authenticity using forensic visual analysis.";
  }
  if (lower.includes('hydroguard') || lower.includes('water')) {
    return "HydroGuard (Water) monitors water quality and environmental safety in your area.";
  }
  if (lower.includes('clearscript') || lower.includes('air') || lower.includes('prescription')) {
    return "ClearScript (Air) decodes handwritten prescriptions and expands medical abbreviations.";
  }
  if (lower.includes('lifeloop') || lower.includes('space') || lower.includes('wellness')) {
    return "LifeLoop (Space) is your holistic health dashboard, synthesizing insights from all modules.";
  }
  return "I'm Aetheria, your Aether Health guide. Ask me about any of the 5 elements: Fire, Water, Air, Earth, or Space.";
};

// ─── Voice Audio (TTS disabled - Gemini TTS not available in Bedrock) ─────────
export const generateVoiceAudio = async (
  _text: string,
  _element: ElementType
): Promise<string | undefined> => {
  // TTS via Bedrock not available with Nova Lite.
  // Can integrate Amazon Polly here in a future phase.
  return undefined;
};

// ─── Main Analysis Function ───────────────────────────────────────────────────
export const generateAetherResponse = async (
  element: ElementType,
  input: string,
  userProfile: UserProfile,
  imagePart?: string,
  contextData?: Record<string, any>
): Promise<AnalysisResult> => {
  const elementToLambda: Partial<Record<ElementType, string>> = {
    [ElementType.FIRE]: LAMBDA_URLS.vitalscan,
    [ElementType.AIR]: LAMBDA_URLS.clearscript,
    [ElementType.EARTH]: LAMBDA_URLS.truemeds,
    [ElementType.WATER]: LAMBDA_URLS.hydroguard,
  };

  // WATER: always call Lambda with userProfile
  if (element === ElementType.WATER) {
    const url = elementToLambda[ElementType.WATER];
    if (!url) throw new Error('HydroGuard Lambda URL not configured.');
    return callLambda(url, { location: input || 'general urban area', userProfile });
  }

  // SPACE: call vitalscan lambda with context, or return static data
  if (element === ElementType.SPACE) {
    const url = LAMBDA_URLS.vitalscan;
    if (url && contextData && Object.keys(contextData).length > 0) {
      return callLambda(url, {
        input: `Generate a LifeLoop holistic wellness dashboard summary based on this health context: ${JSON.stringify(contextData)}`,
        userProfile,
      });
    }
    // Static fallback - always English (no Lambda call needed for welcome screen)
    return {
      dashboardContext: 'Welcome to LifeLoop. Use the other elements to build your health snapshot.',
      actionableTips: ['Stay hydrated - drink 8 glasses of water today.', 'Take a 10-minute walk.', 'Practice box breathing for 5 minutes.'],
      wellnessStrip: [
        { title: 'Box Breathing', type: 'Breathing', instruction: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s.' },
        { title: 'Morning Stretch', type: 'Movement', instruction: 'Gentle full-body stretch for 5 minutes.' },
        { title: 'Mindful Moment', type: 'Mindfulness', instruction: 'Close your eyes and focus on 3 deep breaths.' },
      ],
      newsFeed: [
        { headline: 'WHO: Regular exercise reduces chronic disease risk', summary: 'Even 30 minutes of moderate activity daily shows significant health benefits.', source: 'WHO', relevance: 'General wellness tip.' },
        { headline: 'CDC: Hydration key to cognitive performance', summary: 'Mild dehydration can impair focus and memory.', source: 'CDC', relevance: 'Daily health reminder.' },
      ],
      safetyAdvice: 'Use VitalScan, TrueMeds, HydroGuard, or ClearScript to get personalized insights.',
      reassuranceLine: 'Your health journey starts with small, consistent steps.',
      reasoningSummary: 'No prior element data found. Showing general wellness guidance.',
      emotionalState: 'Calm',
    };
  }

  // FIRE, AIR, EARTH: call respective Lambda
  const url = elementToLambda[element];
  if (!url) {
    throw new Error(
      `Lambda URL not configured for ${element}. Run 'npx ampx sandbox' and set URLs via configureLambdaUrls().`
    );
  }

  const body: Record<string, any> = { userProfile };

  if (element === ElementType.FIRE) {
    body.input = input;
  } else if (element === ElementType.AIR || element === ElementType.EARTH) {
    if (!imagePart) throw new Error('Image required for this module.');
    body.imageBase64 = imagePart;
  }

  return callLambda(url, body);
};
