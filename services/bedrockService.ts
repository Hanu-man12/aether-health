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

// ─── Voice Intent Routing ─────────────────────────────────────────────────────
export const routeVoiceIntent = async (
  text: string,
  userProfile: UserProfile
): Promise<IntentResult> => {
  const lower = text.toLowerCase();

  // ── Module name direct matches (all languages) ──
  // VitalScan / Fire
  if (
    lower.includes('vitalscan') || lower.includes('vital scan') ||
    lower.includes('vital') ||
    lower.includes('symptom') || lower.includes('symptoms') ||
    lower.includes('pain') || lower.includes('sick') || lower.includes('fever') ||
    lower.includes('बीमार') || lower.includes('दर्द') || lower.includes('बुखार') ||
    lower.includes('लक्षण') || lower.includes('vitalscan') ||
    lower.includes('ভাইটাল') || lower.includes('অসুস্থ') || lower.includes('ব্যথা') ||
    lower.includes('জ্বর') || lower.includes('লক্ষণ') ||
    lower.includes('fire') || lower.includes('फायर') || lower.includes('ফায়ার')
  ) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.FIRE, reasoning: 'VitalScan keywords detected' };
  }

  // TrueMeds / Earth
  if (
    lower.includes('truemeds') || lower.includes('true meds') ||
    lower.includes('medicine') || lower.includes('pill') || lower.includes('tablet') ||
    lower.includes('packaging') || lower.includes('drug') || lower.includes('meds') ||
    lower.includes('दवा') || lower.includes('गोली') || lower.includes('ट्रूमेड्स') ||
    lower.includes('ওষুধ') || lower.includes('ট্রুমেডস') ||
    lower.includes('earth') || lower.includes('अर्थ') || lower.includes('আর্থ')
  ) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.EARTH, reasoning: 'TrueMeds keywords detected' };
  }

  // HydroGuard / Water
  if (
    lower.includes('hydroguard') || lower.includes('hydro guard') ||
    lower.includes('water') || lower.includes('drink') || lower.includes('quality') ||
    lower.includes('पानी') || lower.includes('हाइड्रोगार्ड') || lower.includes('जल') ||
    lower.includes('পানি') || lower.includes('জল') || lower.includes('হাইড্রোগার্ড')
  ) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.WATER, reasoning: 'HydroGuard keywords detected' };
  }

  // ClearScript / Air
  if (
    lower.includes('clearscript') || lower.includes('clear script') ||
    lower.includes('prescription') || lower.includes('doctor') ||
    lower.includes('script') || lower.includes('dosage') || lower.includes('receipt') ||
    lower.includes('पर्चा') || lower.includes('नुस्खा') || lower.includes('क्लियरस्क्रिप्ट') ||
    lower.includes('প্রেসক্রিপশন') || lower.includes('ক্লিয়ারস্ক্রিপ্ট') ||
    lower.includes('air') || lower.includes('एयर') || lower.includes('এয়ার')
  ) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.AIR, reasoning: 'ClearScript keywords detected' };
  }

  // LifeLoop / Space — explicit only
  if (
    lower.includes('lifeloop') || lower.includes('life loop') ||
    lower.includes('space') || lower.includes('wellness') || lower.includes('holistic') ||
    lower.includes('लाइफलूप') || lower.includes('স্পেস') || lower.includes('লাইফলুপ')
  ) {
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.SPACE, reasoning: 'LifeLoop keywords detected' };
  }

  // Navigation — back/home
  if (
    lower.includes('back') || lower.includes('home') || lower.includes('dashboard') ||
    lower.includes('menu') || lower.includes('वापस') || lower.includes('होम') ||
    lower.includes('ফিরে') || lower.includes('হোম')
  ) {
    return { action: 'NAVIGATE_DASHBOARD', reasoning: 'Navigation keywords detected' };
  }

  // Help / explain
  if (
    lower.includes('help') || lower.includes('what') || lower.includes('how') ||
    lower.includes('explain') || lower.includes('क्या') || lower.includes('कैसे') ||
    lower.includes('কী') || lower.includes('কিভাবে')
  ) {
    return { action: 'EXPLAIN', reasoning: 'Help request detected' };
  }

  // Default: EXPLAIN instead of blindly going to LifeLoop
  return { action: 'EXPLAIN', reasoning: 'No clear intent detected' };
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

// ─── Language code map for Web Speech API ────────────────────────────────────
const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  bn: 'bn-BD', // bn-BD has better browser support than bn-IN
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  zh: 'zh-CN',
  ja: 'ja-JP',
};

// Languages where browser TTS voice availability is unreliable — fallback to en-US
const FALLBACK_TO_EN = new Set(['bn']);

// ─── TTS via Web Speech API (browser-native, no Lambda needed) ───────────────
const getAvailableVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise(resolve => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      // Voices load async on first call
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
      // Timeout fallback — 500ms
      setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
    }
  });
};

export const speakText = async (text: string, lang: string = 'en'): Promise<void> => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetLang = LANG_TO_BCP47[lang] || 'en-US';
  const langPrefix = targetLang.split('-')[0]; // e.g. 'bn', 'hi', 'zh'

  const voices = await getAvailableVoices();
  const hasVoice = voices.some(v => v.lang.startsWith(langPrefix));

  if (!hasVoice && FALLBACK_TO_EN.has(lang)) {
    // No voice found for this language — use English so user hears something
    utterance.lang = 'en-US';
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;
  } else {
    utterance.lang = targetLang;
    // Pick best matching voice if available
    const match = voices.find(v => v.lang === targetLang) || voices.find(v => v.lang.startsWith(langPrefix));
    if (match) utterance.voice = match;
  }

  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

export const isSpeaking = (): boolean => {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
};

// ─── Legacy stub — kept for backward compat, no longer used for audio ────────
export const generateVoiceAudio = async (
  _text: string,
  _element: ElementType
): Promise<string | undefined> => {
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
    [ElementType.SPACE]: LAMBDA_URLS.lifeloop,
  };

  // WATER: always call Lambda with userProfile
  if (element === ElementType.WATER) {
    const url = elementToLambda[ElementType.WATER];
    if (!url) throw new Error('HydroGuard Lambda URL not configured.');
    return callLambda(url, { location: input || 'general urban area', userProfile });
  }

  // SPACE: call lifeloop lambda with full context
  if (element === ElementType.SPACE) {
    const url = LAMBDA_URLS.lifeloop;
    if (url) {
      return callLambda(url, {
        input: input || 'Generate holistic health overview',
        userProfile,
        contextData: contextData || {},
      });
    }
    // Static fallback if lifeloop URL not configured
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
      reasoningSummary: 'LifeLoop URL not configured. Showing general wellness guidance.',
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
