import { GoogleGenAI, Modality } from "@google/genai";
import { ElementType, AnalysisResult, UserProfile, IntentResult } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for structured output
const fireSchema = {
  type: "OBJECT",
  properties: {
    emotionalState: { type: "STRING" },
    likelyCauses: { 
      type: "ARRAY", 
      items: {
        type: "OBJECT",
        properties: {
          cause: { type: "STRING" },
          probability: { type: "STRING" }
        }
      } 
    },
    whatThisMeans: { type: "STRING" },
    safetyAdvice: { type: "STRING" },
    reassuranceLine: { type: "STRING" },
    reasoningSummary: { type: "STRING" }
  },
  required: ["emotionalState", "likelyCauses", "whatThisMeans", "safetyAdvice", "reassuranceLine", "reasoningSummary"]
};

const earthSchema = {
  type: "OBJECT",
  properties: {
    medicineIdentified: { type: "STRING" },
    authenticityConfidence: { type: "STRING", enum: ["High", "Medium", "Low"] },
    redFlags: { type: "ARRAY", items: { type: "STRING" } },
    safetyAdvice: { type: "STRING" },
    reassuranceLine: { type: "STRING" },
    reasoningSummary: { type: "STRING" }
  },
  required: ["medicineIdentified", "authenticityConfidence", "safetyAdvice", "reassuranceLine"]
};

const spaceSchema = {
  type: "OBJECT",
  properties: {
    dashboardContext: { type: "STRING", description: "A synthesis of the user's health context based on inputs." },
    actionableTips: { type: "ARRAY", items: { type: "STRING" }, description: "3 simple, non-medical steps to take today." },
    wellnessStrip: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          type: { type: "STRING", enum: ["Breathing", "Movement", "Sleep", "Nutrition", "Mindfulness"] },
          instruction: { type: "STRING" }
        }
      }
    },
    newsFeed: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          headline: { type: "STRING" },
          summary: { type: "STRING" },
          source: { type: "STRING", description: "e.g., WHO, CDC, Global Health" },
          relevance: { type: "STRING", description: "Why this matters to the user." }
        }
      }
    },
    culturalNotes: { type: "STRING" },
    reassuranceLine: { type: "STRING" },
    reasoningSummary: { type: "STRING" },
    safetyAdvice: { type: "STRING" }
  },
  required: ["dashboardContext", "actionableTips", "wellnessStrip", "newsFeed", "reassuranceLine", "reasoningSummary", "safetyAdvice"]
};

const waterSchema = {
  type: "OBJECT",
  properties: {
    waterQualityRisk: { type: "STRING", enum: ["Low", "Moderate", "High"] },
    reportSummary: { type: "STRING" },
    reassuranceLine: { type: "STRING" },
    reasoningSummary: { type: "STRING" },
    safetyAdvice: { type: "STRING" }
  }
};

const airSchema = {
  type: "OBJECT",
  properties: {
    ocrInterpretation: { type: "STRING" },
    medications: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          dosage: { type: "STRING" },
          frequency: { type: "STRING" },
          duration: { type: "STRING" },
          instructions: { type: "STRING" },
          confidence: { type: "STRING", enum: ["High", "Medium", "Low"] }
        }
      }
    },
    ambiguityFlags: { type: "ARRAY", items: { type: "STRING" } },
    graphologyAnalysis: { 
      type: "ARRAY", 
      items: { 
        type: "OBJECT", 
        properties: {
          observedStroke: { type: "STRING" },
          interpretedAs: { type: "STRING" },
          confidence: { type: "STRING" },
          strokePressure: { type: "STRING", description: "Inferred pressure: Light, Medium, Heavy" },
          slant: { type: "STRING", description: "Inferred slant: Left, Vertical, Right" }
        }
      } 
    },
    verificationRequired: { type: "BOOLEAN" },
    safetyAdvice: { type: "STRING" },
    reassuranceLine: { type: "STRING" },
    reasoningSummary: { type: "STRING" }
  },
  required: ["medications", "safetyAdvice", "reassuranceLine", "reasoningSummary"]
};

const intentSchema = {
  type: "OBJECT",
  properties: {
    action: { type: "STRING", enum: ["NAVIGATE_ELEMENT", "NAVIGATE_DASHBOARD", "EXPLAIN"] },
    targetElement: { type: "STRING", enum: ["FIRE", "EARTH", "WATER", "AIR", "SPACE"], nullable: true },
    reasoning: { type: "STRING" }
  },
  required: ["action", "reasoning"]
};

// Fallback Logo (Abstract Gradient Orb) in case of API Quota Limits
const FALLBACK_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImdyYWQxIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiIGZ4PSI1MCUiIGZ5PSI1MCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM2MzY2ZjE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojODU0ZDBlO3N0b3Atb3BhY2l0eToxIiAvPjwvcmFkaWFsR3JhZGllbnQ+PC9kZWZzPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjU2IiBmaWxsPSIjMGUxMjE4IiAvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMjUwIiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjZ3JhZDEpIiBzdHJva2Utd2lkdGg9IjQiIC8+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIxMDAiIGZpbGw9InVybCgjZ3JhZDEpIiBvcGFjaXR5PSIwLjgiIC8+PGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIxNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMiIgLz48L3N2Zz4=";

// Generate App Logo using Nano Banana
export const generateAppLogo = async (): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: "A minimalist, abstract, and elegant logo for a healthcare AI app named 'Aether Health'. The design should represent the five elements (Fire, Water, Air, Earth, Space) harmoniously intertwined in a circular emblem. Modern, trustworthy, medical-tech aesthetic. Dark background, glowing accents. Vector style, flat design, icon only." }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
       if (part.inlineData) {
         return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
       }
    }
    return FALLBACK_LOGO;
  } catch (e) {
    console.warn("Logo Generation Warning: Using fallback logo due to API limits or network issue.", e);
    return FALLBACK_LOGO;
  }
};

export const routeVoiceIntent = async (
  text: string,
  userProfile: UserProfile
): Promise<IntentResult> => {
  try {
    const prompt = `
    You are the Voice Router for Aether Health.
    Analyze the user's spoken input and determine the correct Action and Target.

    ACTIONS:
    - NAVIGATE_DASHBOARD: User wants to go back, go home, go to main menu, or exit the current screen.
    - NAVIGATE_ELEMENT: User wants to open a specific tool, module, or has a query suited for a specific element.
    - EXPLAIN: User is asking for help about the app, asking what an element does, or needs guidance.

    ELEMENT DEFINITIONS (for NAVIGATE_ELEMENT):
    - FIRE: Symptoms, pain, anxiety, feeling sick, "I don't feel well", VitalScan.
    - EARTH: Medicine authenticity, checking pills, packaging issues, TrueMeds.
    - WATER: Water quality, environmental safety, "is this water safe", HydroGuard.
    - AIR: Prescriptions, reading doctor's notes, dosage confusion, ClearScript.
    - SPACE: General wellness, translation, cultural advice, holistic health, LifeLoop.

    USER INPUT: "${text}"
    USER LANGUAGE: ${userProfile.language}

    Return JSON with 'action', 'targetElement' (if applicable), and 'reasoning'.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: intentSchema
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as IntentResult;
  } catch (error) {
    console.error("Intent Routing Error:", error);
    // Fallback to SPACE
    return { action: 'NAVIGATE_ELEMENT', targetElement: ElementType.SPACE, reasoning: "Fallback to universal handler." };
  }
};

export const getBuddyResponse = async (query: string, userProfile: UserProfile): Promise<string> => {
  const prompt = `
  You are Aetheria, the AI guide for the Aether Health app.
  The user is asking: "${query}"
  
  Explain the feature or answer the question briefly (max 2 sentences).
  The app has 5 elements:
  - Fire (VitalScan): Symptom checker.
  - Water (HydroGuard): Water safety monitor.
  - Air (ClearScript): Prescription decoder.
  - Earth (TrueMeds): Medicine packaging verifier.
  - Space (LifeLoop): Holistic health dashboard.
  
  Tone: ${userProfile.tone}, Helpful, Friendly.
  Language: ${userProfile.language}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "I'm here to help navigate your health journey.";
  } catch (e) {
    return "I'm having trouble connecting right now, but I'm here to help.";
  }
};

export const generateVoiceAudio = async (
  text: string,
  element: ElementType
): Promise<string | undefined> => {
  try {
    // Map Element to Voice
    let voiceName = 'Kore'; // Default (Fire)
    switch (element) {
      case ElementType.FIRE: voiceName = 'Kore'; break;
      case ElementType.EARTH: voiceName = 'Fenrir'; break;
      case ElementType.WATER: voiceName = 'Puck'; break;
      case ElementType.AIR: voiceName = 'Charon'; break;
      case ElementType.SPACE: voiceName = 'Zephyr'; break;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Voice Generation Error:", error);
    return undefined;
  }
}

export const generateAetherResponse = async (
  element: ElementType,
  input: string,
  userProfile: UserProfile,
  imagePart?: string,
  contextData?: Record<string, any> // New parameter for passing data from other elements
): Promise<AnalysisResult> => {

  // MOCK RESPONSE FOR WATER (HydroGuard)
  // Simulating environmental sensor analysis for the demo
  if (element === ElementType.WATER) {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
    
    // Basic mock localization logic for demo purposes
    const isEn = userProfile.language === 'en';
    const isEs = userProfile.language === 'es';
    
    let summary = 'Simulated analysis of local reservoir inputs indicates slightly elevated turbidity levels due to recent seasonal rainfall.';
    let advice = 'Tap water remains safe for consumption.';
    let reassurance = 'City filtration systems are effectively managing the increased sediment load.';

    if (isEs) {
      summary = 'El análisis simulado indica niveles de turbidez ligeramente elevados debido a las lluvias recientes.';
      advice = 'El agua del grifo sigue siendo segura para el consumo.';
      reassurance = 'Los sistemas de filtración de la ciudad están gestionando eficazmente la carga de sedimentos.';
    }

    return {
      waterQualityRisk: 'Moderate',
      reportSummary: summary,
      reasoningSummary: 'Cross-referenced municipal sensor data with meteorological patterns.',
      safetyAdvice: advice,
      reassuranceLine: reassurance,
      whatThisMeans: isEn ? 'The water might look a bit cloudy, but it is safe.' : 'El agua puede parecer turbia, pero es segura.',
      emotionalState: 'Calm'
    };
  }

  let modelName = 'gemini-3-flash-preview';
  let systemPrompt = SYSTEM_INSTRUCTION;
  
  // INJECT USER PROFILE
  systemPrompt += `\n
  CRITICAL PROFILE CONTEXT:
  - User Language: ${userProfile.language}
  - Preferred Tone: ${userProfile.tone}
  - Accessibility: ${userProfile.accessibility.largeText ? 'Use simple, clear structure.' : 'Standard.'}
  
  Generate ALL output in the specified language: ${userProfile.language}.
  Adopt the requested tone: ${userProfile.tone}.
  `;

  let userPrompt = input;
  let responseSchema: any = {};

  switch (element) {
    case ElementType.FIRE:
      systemPrompt += `
      MODE: FIRE (VitalScan).
      Task: Analyze symptoms to reduce anxiety.
      1. Detect emotional tone (fear, panic, neutral).
      2. Identify likely causes using standard medical reasoning.
      3. Assign probabilities.
      4. Reassure the user.
      5. State clearly when to seek help.
      `;
      responseSchema = fireSchema;
      break;

    case ElementType.EARTH:
      // UPGRADED to gemini-3-flash-preview for Deep Forensic Vision Analysis + JSON
      modelName = 'gemini-3-flash-preview';
      systemPrompt += `
      MODE: EARTH (TrueMeds).
      Task: Perform a deep forensic analysis of medicine packaging to verify authenticity.
      
      ANALYSIS PROTOCOLS:
      1. **Typography & Layout**: Detect inconsistent fonts, misaligned text, or poor kerning typical of counterfeits.
      2. **Print Quality**: Check for color bleeding, blurry logos, or low-resolution imagery.
      3. **Structural Integrity**: Identify damaged seals, tampered blisters, or asymmetry in packaging.
      4. **Data Verification**: Inspect Batch Numbers and Expiry Dates. Authentic packs usually have these stamped/embossed; fakes often have them printed flat.
      5. **Language & Grammar**: flagging any misspellings or awkward phrasing.

      OUTPUT REQUIREMENTS:
      - medicineIdentified: Name and type of the product.
      - authenticityConfidence: 'High' (Looks genuine), 'Medium' (Inconclusive), 'Low' (Suspicious).
      - redFlags: A list of specific anomalies found (e.g. "Typos in instruction text", "Flat printed batch number", "Blurry hologram").
      - safetyAdvice: Specific guidance (e.g. "Do not consume if seal is broken", "Cross-reference batch #12345").
      - reassuranceLine: A calm, supportive closing statement regarding the check.
      - reasoningSummary: A technical summary of the visual analysis (e.g. "Fonts match manufacturer standards; seals intact.").
      `;
      userPrompt = "Perform forensic verification on this medicine packaging.";
      responseSchema = earthSchema;
      break;

    case ElementType.SPACE:
      systemPrompt += `
      YOU ARE LIFELOOP (SPACE ELEMENT).
      Your role is to act as the unifying intelligence and central health dashboard.
      
      CONTEXT FROM OTHER ELEMENTS:
      ${contextData ? JSON.stringify(contextData) : "No specific user data available."}
      
      USER INPUT (Optional): "${input}"

      TASK:
      1. Synthesize a "Personal Health Snapshot" based on provided context.
      2. If NO context exists:
         - Provide a gentle "Welcome" context encouraging the user to use other elements.
         - Generate generic, safe wellness tips (e.g., hydration, sleep).
         - Generate "General Health Updates" for the News Feed.
      3. If context EXISTS:
         - Synthesize findings into a coherent status.
         - Generate specific "Actionable Tips".
         - Generate News Feed items relevant to the findings (or general if findings are obscure).
      4. Provide exactly 2 items for "News Feed" (Global health updates, verified sources like WHO/CDC).
      5. Create a "Holistic Wellness Strip" with exactly 3 exercises.
         IMPORTANT MANDATE: You MUST ALWAYS include "Box Breathing" as one of the exercises in the wellnessStrip.
         - Title: Box Breathing
         - Type: Breathing
         - Instruction: "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s."
      
      CRITICAL: Keep all summaries and descriptions extremely concise (1 sentence max) to ensure low latency.
      
      OUTPUT MAPPING (JSON):
      - dashboardContext: The synthesis summary or welcome message.
      - actionableTips: List of simple steps.
      - wellnessStrip: Array of exercises with title, type, instruction (Must include Box Breathing).
      - newsFeed: Array of news items (headline, summary, source, relevance).
      - safetyAdvice: Guidance on next steps.
      - reassuranceLine: Closing supportive sentence.
      - reasoningSummary: Brief explanation of how you connected the dots.
      `;
      responseSchema = spaceSchema;
      break;

    case ElementType.AIR:
      // UPGRADE to gemini-3-flash-preview for Advanced Stroke Recognition
      modelName = 'gemini-3-flash-preview';
      systemPrompt += `
      MODE: AIR (ClearScript).
      Task: Act as an expert **Clinical Pharmacist** and **Forensic Graphologist**. 
      Your goal is to decipher bad handwriting (doctor's script) on prescriptions and translate it into clear, safe patient instructions.
      
      STEP 1: ADVANCED STROKE RECOGNITION (Forensic Graphology)
      - Analyze the ductus (direction of strokes), pen pressure (inferred from line thickness), and slant.
      - Identify specific allographs (letter shapes) typical of medical shorthand.
      - If text is illegible, analyze the stroke count, ascenders (l, t, h), and descenders (g, p, y) to infer the word.
      - Example: A squiggly line with a cross near the top is likely 't'.
      - Example: A trailing loop is likely 'g' (mg) or 'y' (daily).
      
      STEP 2: MEDICAL SHORTHAND DECODING (Contextual Intelligence)
      - You MUST expand all Latin Abbreviations (Sig Codes).
      - 'PO' -> 'By Mouth'
      - 'BID' -> 'Twice Daily' (Every 12 hours)
      - 'TID' -> 'Three Times Daily' (Every 8 hours)
      - 'QID' -> 'Four Times Daily'
      - 'QD' or 'OD' -> 'Once Daily'
      - 'HS' -> 'At Bedtime'
      - 'PRN' -> 'As Needed'
      - 'AC' -> 'Before Meals'
      - 'PC' -> 'After Meals'
      
      STEP 3: DRUG & DOSAGE MATCHING
      - Match partial words to known medications based on common dosages.
      - If you see "Amox..." and "500mg", infer "Amoxicillin".
      - If you see "Metf..." and "1000mg", infer "Metformin".
      
      OUTPUT REQUIREMENTS (Strict JSON):
      - Use the provided schema.
      - Include 'strokePressure' and 'slant' in graphologyAnalysis.
      
      IMPORTANT: If the image is NOT a prescription, return "ocrInterpretation": "This does not appear to be a prescription." and empty arrays.
      `;
      responseSchema = airSchema;
      break;
  }

  try {
    const config: any = {
      systemInstruction: systemPrompt,
    };

    // Use responseSchema for all elements now that AIR is upgraded
    config.responseMimeType = "application/json";
    config.responseSchema = responseSchema;

    // SPEED OPTIMIZATION FOR SPACE
    if (element === ElementType.SPACE) {
       config.thinkingConfig = { thinkingBudget: 0 }; // Disable thinking tokens to reduce latency significantly
    }

    let contents: any = userPrompt;

    if (imagePart && (element === ElementType.EARTH || element === ElementType.AIR)) {
      contents = {
        parts: [
          { inlineData: { mimeType: 'image/png', data: imagePart } },
          { text: userPrompt }
        ]
      };
    } else if (element === ElementType.SPACE && !userPrompt) {
        // Space might run without direct user text input if just aggregating
        contents = "Generate dashboard.";
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanedText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};