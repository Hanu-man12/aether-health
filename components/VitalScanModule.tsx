import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, UserProfile } from '../types';
import { FireIcon } from '../constants';
import VoiceInput from './VoiceInput';

interface VitalScanModuleProps {
  onBack: () => void;
  onAnalyze: (input: string) => void;
  result: { data: AnalysisResult, timestamp: number } | null;
  loading: boolean;
  error: string | null;
  t: any;
  userProfile: UserProfile;
}

const PROMPTS = [
  "What are you feeling right now?",
  "When did you first notice this?",
  "Describe the sensation in your own words...",
  "Take a breath. Tell me what's happening."
];

const LOADING_PHRASES = [
  "Sensing emotional resonance...", 
  "Mapping symptom patterns...", 
  "Calibrating severity metrics...", 
  "Consulting medical knowledge base...", 
  "Formulating safety guidance..."
];

const VitalScanModule: React.FC<VitalScanModuleProps> = ({ 
  onBack, 
  onAnalyze, 
  result, 
  loading, 
  error, 
  t,
  userProfile
}) => {
  const [input, setInput] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [loadingText, setLoadingText] = useState(LOADING_PHRASES[0]);
  
  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Cycle prompts gently
  useEffect(() => {
    if (input) return; // Stop cycling if user types
    const interval = setInterval(() => {
      setPromptIndex(prev => (prev + 1) % PROMPTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [input]);

  // Progressive loading text
  useEffect(() => {
    if (!loading) return;
    let i = 0;
    setLoadingText(LOADING_PHRASES[0]);
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_PHRASES.length;
      setLoadingText(LOADING_PHRASES[i]);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = () => {
    if (!input.trim()) return;
    onAnalyze(input);
  };

  const handleVoiceTranscript = (text: string) => {
    if (text) {
      setInput(prev => {
        const spacer = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + spacer + text;
      });
    }
  };

  const hasResult = !!result?.data;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-3xl mx-auto flex flex-col items-center animate-fade-in">
      
      {/* --- HEADER --- */}
      <div className="w-full flex items-center justify-between mb-12 opacity-80 hover:opacity-100 transition-opacity">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-amber-200/60 hover:text-amber-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7 7-7" /></svg>
          <span className="text-xs font-bold uppercase tracking-widest">Return</span>
        </button>
        
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full bg-amber-500 ${loading ? 'animate-ping' : ''}`}></div>
           <span className="text-xs font-serif italic text-amber-200/60">VitalScan Active</span>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="w-full flex-1 flex flex-col items-center">
        
        {/* ICON IDENTITY */}
        <div className={`
           mb-8 transition-all duration-700
           ${hasResult ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}
        `}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/20 to-red-900/20 border border-amber-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.15)]">
            <FireIcon className="w-8 h-8 text-amber-200" />
          </div>
        </div>

        {/* INPUT SECTION (Collapses slightly when result shown) */}
        <div className={`w-full transition-all duration-700 ease-in-out ${hasResult ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
          
          <h1 className={`text-center font-serif text-3xl md:text-4xl text-amber-50 mb-8 transition-all duration-700 ${hasResult ? 'text-2xl opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}>
             {input ? "I'm listening." : <span className="animate-fade-in key-{promptIndex}">{PROMPTS[promptIndex]}</span>}
          </h1>

          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/5 via-red-500/5 to-amber-500/5 rounded-3xl blur-xl transition-opacity duration-1000 ${loading ? 'opacity-100 animate-pulse' : 'opacity-0 group-hover:opacity-100'}`}></div>
            <div className="relative bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl transition-colors focus-within:border-amber-500/30 focus-within:bg-[#232325]">
               <textarea
                 ref={textareaRef}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 disabled={loading}
                 placeholder="Type here..."
                 className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl text-white/90 placeholder-white/20 resize-none min-h-[120px] leading-relaxed font-serif"
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleAnalyze();
                   }
                 }}
               />
               
               <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-4">
                     <VoiceInput 
                        onTranscript={handleVoiceTranscript} 
                        userProfile={userProfile} 
                        t={t} 
                        compact={true} 
                     />
                     <div className="text-xs text-white/30 font-medium uppercase tracking-widest flex items-center gap-3 hidden sm:flex">
                        {loading ? (
                          <>
                            <div className="flex items-center gap-1 h-4">
                              <div className="w-1 bg-amber-500 animate-[wave_1s_ease-in-out_infinite] h-2"></div>
                              <div className="w-1 bg-amber-500 animate-[wave_1s_ease-in-out_infinite] h-4 animation-delay-100"></div>
                              <div className="w-1 bg-amber-500 animate-[wave_1s_ease-in-out_infinite] h-3 animation-delay-200"></div>
                              <div className="w-1 bg-amber-500 animate-[wave_1s_ease-in-out_infinite] h-2 animation-delay-300"></div>
                            </div>
                            <span className="text-amber-400 animate-pulse transition-all duration-300 min-w-[180px]">
                              {loadingText}
                            </span>
                          </>
                        ) : (
                          <span>Secure & Private</span>
                        )}
                     </div>
                  </div>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={!input.trim() || loading}
                    className={`
                       px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all duration-500
                       ${!input.trim() 
                          ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                          : loading
                            ? 'bg-amber-500/20 text-amber-200 cursor-wait'
                            : 'bg-amber-600 text-white hover:bg-amber-500 hover:scale-105 shadow-lg shadow-amber-900/20'
                       }
                    `}
                  >
                    {loading ? 'Analyzing' : 'Begin Analysis'}
                  </button>
               </div>
            </div>
          </div>
          
          {error && (
            <p className="text-center text-red-400 text-sm mt-4 animate-fade-in">{error}</p>
          )}
        </div>

        {/* --- RESULT SECTION (Grows Dynamically) --- */}
        {hasResult && result && (
           <div className="w-full mt-12 animate-slide-up space-y-8 pb-12">
             
             {/* 1. Emotional Mirror (Reassurance) */}
             <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-amber-200/80 mb-4">
                  <span>Emotional Tone Detected: {result.data.emotionalState}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-white leading-relaxed">
                   "{result.data.reassuranceLine}"
                </h2>
             </div>

             {/* 2. Insight Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Likely Causes */}
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                   <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                     Observation
                   </h3>
                   <div className="space-y-4">
                     {result.data.likelyCauses?.map((cause, idx) => (
                       <div key={idx} className="relative pt-1">
                          <div className="flex items-center justify-between mb-1">
                             <span className="text-sm font-medium text-white/90">{cause.cause}</span>
                             <span className="text-xs text-white/50">{cause.probability}</span>
                          </div>
                          <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-white/5">
                             <div style={{ width: cause.probability.includes('High') ? '80%' : cause.probability.includes('Medium') ? '50%' : '30%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500/50"></div>
                          </div>
                       </div>
                     ))}
                   </div>
                   {result.data.whatThisMeans && (
                      <p className="mt-6 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {result.data.whatThisMeans}
                      </p>
                   )}
                </div>

                {/* Safety & Guidance */}
                <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-900/10 to-transparent border border-amber-500/10 hover:border-amber-500/20 transition-colors">
                   <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                     Guidance
                   </h3>
                   <p className="text-lg font-serif text-white/90 mb-6">
                     {result.data.safetyAdvice}
                   </p>
                   
                   <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-1 bg-white/10 rounded-lg">
                           <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                         </div>
                         <span className="text-[10px] uppercase tracking-widest text-gray-500">Trust Engine</span>
                      </div>
                      <p className="text-xs text-gray-500 italic">
                        "{result.data.reasoningSummary}"
                      </p>
                   </div>
                </div>

             </div>

             {/* Footer Note */}
             <div className="text-center pt-8 opacity-60">
               <p className="text-xs text-amber-200/40">Remember: Aether Health provides information, not medical diagnosis.</p>
             </div>

           </div>
        )}

      </div>
    </div>
  );
};

export default VitalScanModule;