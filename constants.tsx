import React from 'react';
import { ElementType, ElementConfig } from './types';

// Icons
export const FireIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3a1 1 0 0 1 1.9 1Z" />
  </svg>
);

export const EarthIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21.54 15H17a2 2 0 0 0-2 2v4.54" />
    <path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17" />
    <path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

export const WaterIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
  </svg>
);

export const AirIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.5 19c0-1.7-1.3-3-3-3h-11" />
    <path d="M11.5 11c0-1.7-1.3-3-3-3h-5" />
    <path d="M19.5 7c0-1.7-1.3-3-3-3h-13" />
  </svg>
);

export const SpaceIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const ELEMENTS: Record<ElementType, ElementConfig> = {
  [ElementType.FIRE]: {
    id: ElementType.FIRE,
    name: 'VitalScan',
    tagline: 'AI Symptom Checker',
    description: 'Detect emotional tone and analyze symptoms without health anxiety.',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-red-600/20',
    textAccent: 'text-amber-500',
    bg: 'bg-amber-50',
    color: 'text-amber-700',
    icon: FireIcon,
    inputType: 'text',
    placeholder: 'Describe your symptoms. We’ll help you understand them calmly...'
  },
  [ElementType.WATER]: {
    id: ElementType.WATER,
    name: 'HydroGuard',
    tagline: 'Water Quality Monitor',
    description: 'Simulate environmental water safety reports for civic awareness.',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-teal-500/20',
    textAccent: 'text-blue-400',
    bg: 'bg-blue-50',
    color: 'text-blue-700',
    icon: WaterIcon,
    inputType: 'mock_action',
  },
  [ElementType.AIR]: {
    id: ElementType.AIR,
    name: 'ClearScript',
    tagline: 'Prescription Decoder',
    description: 'Upload a prescription photo to clarify instructions safely using AI.',
    gradientFrom: 'from-cyan-500/20',
    gradientTo: 'to-slate-500/20',
    textAccent: 'text-cyan-400',
    bg: 'bg-cyan-50',
    color: 'text-cyan-700',
    icon: AirIcon,
    inputType: 'image',
  },
  [ElementType.EARTH]: {
    id: ElementType.EARTH,
    name: 'TrueMeds',
    tagline: 'Medicine Verifier',
    description: 'Check medicine packaging for authenticity cues using AI vision.',
    gradientFrom: 'from-emerald-500/20',
    gradientTo: 'to-indigo-900/20',
    textAccent: 'text-emerald-400',
    bg: 'bg-emerald-50',
    color: 'text-emerald-700',
    icon: EarthIcon,
    inputType: 'image',
  },
  [ElementType.SPACE]: {
    id: ElementType.SPACE,
    name: 'LifeLoop',
    tagline: 'Universal Translation',
    description: 'Unifying intelligence. Synthesizes insights into holistic, culturally inclusive guidance.',
    gradientFrom: 'from-violet-500/20',
    gradientTo: 'to-fuchsia-900/20',
    textAccent: 'text-violet-400',
    bg: 'bg-violet-50',
    color: 'text-violet-700',
    icon: SpaceIcon,
    inputType: 'text',
    placeholder: 'Enter a health summary, symptoms, or ask for holistic advice based on your situation...'
  }
};

export const SYSTEM_INSTRUCTION = `
You are Aether Health, a Responsible AI healthcare assistant.
Your goal is to provide calm, accurate, culturally inclusive, and non-alarmist health assistance.
You are NOT a doctor. Never provide definitive medical diagnoses or treatment plans.
Always prioritize harm reduction and safety.
Use probability-based reasoning.
Avoid fear-inducing language.

OUTPUT FORMAT:
You must always return a valid JSON object. Do not wrap it in markdown code blocks.
`;