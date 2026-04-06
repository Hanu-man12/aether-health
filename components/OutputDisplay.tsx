import React, { useState, useEffect } from 'react';
import { AnalysisResult, ElementType } from '../types';
import { ELEMENTS } from '../constants';

interface OutputDisplayProps {
  element: ElementType;
  result: AnalysisResult;
  t: any; // Translations
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ element, result, t }) => {
  const config = ELEMENTS[element];
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  // Reset feedback when the result changes (new analysis)
  useEffect(() => {
    setFeedback(null);
  }, [result]);

  return (
    <div className="glass-card rounded-3xl overflow-hidden animate-slide-up h-full flex flex-col">
      
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} px-8 py-6 border-b border-white/5 flex justify-between items-center`}>
        <h2 className="text-xl font-semibold text-white flex items-center gap-3 font-display">
          <config.icon className="w-6 h-6 text-white/90" />
          <span>{t.analyze} Complete</span>
        </h2>
        {result.authenticityConfidence && (
           <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border ${
             result.authenticityConfidence.toLowerCase().includes('high') 
               ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
               : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
           }`}>
             Confidence: {result.authenticityConfidence}
           </span>
        )}
      </div>

      <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        
        {/* Fire: Likely Causes */}
        {element === ElementType.FIRE && result.likelyCauses && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Probabilistic Assessment</h3>
            <div className="grid gap-3">
              {result.likelyCauses.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <span className="font-medium text-gray-200 group-hover:text-white transition-colors">{item.cause}</span>
                  <span className="text-sm font-bold text-fire-500">{item.probability}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earth: Red Flags */}
        {element === ElementType.EARTH && result.medicineIdentified && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visual Inspection</h3>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-gray-400 text-sm mb-1">Identified Product</p>
              <p className="text-lg font-medium text-white">{result.medicineIdentified}</p>
            </div>
             {result.redFlags && result.redFlags.length > 0 ? (
               <div className="space-y-2">
                 <p className="text-xs text-red-400 font-semibold uppercase">Anomalies Detected</p>
                 <ul className="space-y-2">
                   {result.redFlags.map((flag, i) => (
                     <li key={i} className="flex items-start gap-2 text-sm text-red-300 bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                       <span className="mt-1 block w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                       {flag}
                     </li>
                   ))}
                 </ul>
               </div>
             ) : (
               <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 No immediate visual red flags detected.
               </div>
             )}
          </div>
        )}

        {/* Space: Localized & Wellness */}
        {element === ElementType.SPACE && (
          <div className="space-y-6">
             <div className="p-6 bg-white/5 rounded-2xl border border-white/10 text-gray-200 leading-relaxed">
               {result.localizedExplanation}
             </div>
             <div>
               <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Holistic Suggestions</h3>
               <div className="flex flex-wrap gap-2">
                 {result.wellnessSuggestions?.map((s, i) => (
                   <span key={i} className="px-4 py-2 bg-space-500/10 border border-space-500/20 rounded-full text-sm text-space-200">
                     {s}
                   </span>
                 ))}
               </div>
             </div>
             {result.culturalNotes && (
               <p className="text-sm text-gray-400 italic border-l-2 border-space-500/30 pl-4 py-1">
                 {result.culturalNotes}
               </p>
             )}
          </div>
        )}

        {/* Water: Risk Report */}
        {element === ElementType.WATER && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
               <div className="text-sm text-gray-400">Risk Level Assessment</div>
               <div className={`ml-auto px-4 py-1 rounded text-sm font-bold uppercase tracking-wider ${
                 result.waterQualityRisk === 'High' ? 'bg-red-500/20 text-red-400' : result.waterQualityRisk === 'Moderate' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
               }`}>
                 {result.waterQualityRisk}
               </div>
             </div>
             <p className="text-gray-300 leading-relaxed">{result.reportSummary}</p>
          </div>
        )}

        {/* Air: Prescription Decoder */}
        {element === ElementType.AIR && (
          <div className="space-y-6">
             {/* Verification Warning */}
             {result.verificationRequired && (
               <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                    <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide">Verification Required</h4>
                    <p className="text-amber-200/80 text-xs mt-1">Some text was unclear. Please verify with a pharmacist.</p>
                  </div>
               </div>
             )}

             {/* Medications List */}
             {result.medications && result.medications.length > 0 ? (
               <div className="space-y-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Decoded Instructions</h3>
                 <div className="grid gap-4">
                    {result.medications.map((med, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider ${
                          med.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {med.confidence} Conf.
                        </div>
                        <h4 className="text-xl font-display font-semibold text-white mb-1">{med.name}</h4>
                        <div className="flex flex-wrap gap-2 mb-4 text-xs font-mono text-cyan-300">
                           <span className="bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/20">{med.dosage}</span>
                           <span className="bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/20">{med.frequency}</span>
                           <span className="bg-cyan-900/30 px-2 py-1 rounded border border-cyan-500/20">{med.duration}</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-3">
                          <strong className="text-gray-500 uppercase text-[10px] block mb-1">Instructions</strong>
                          {med.instructions}
                        </p>
                      </div>
                    ))}
                 </div>
               </div>
             ) : (
               <div className="p-6 bg-black/20 rounded-xl border border-white/10 font-mono text-sm text-gray-300 shadow-inner">
                  {result.ocrInterpretation}
               </div>
             )}

             {result.ambiguityFlags && result.ambiguityFlags.length > 0 && (
               <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-sm text-red-200">
                 <strong className="block mb-1 text-red-400 uppercase text-xs">Unclear Items Detected</strong> 
                 <ul className="list-disc pl-4 space-y-1 opacity-80">
                   {result.ambiguityFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                 </ul>
               </div>
             )}
          </div>
        )}
        
        {/* Universal Sections */}
        {result.whatThisMeans && (
          <div className="bg-blue-500/5 p-6 rounded-2xl border border-blue-500/10">
            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-widest mb-2">Interpretation</h3>
            <p className="text-blue-100/80 text-sm leading-relaxed">{result.whatThisMeans}</p>
          </div>
        )}

        {result.safetyAdvice && (
           <div className="flex gap-4 items-start p-5 bg-white/5 rounded-2xl border-l-4 border-gray-500">
             <div className="p-2 bg-gray-700 rounded-lg text-gray-300 shrink-0">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <div>
               <h3 className="font-semibold text-gray-200 text-sm mb-1 font-display">Safety Guidance</h3>
               <p className="text-sm text-gray-400">{result.safetyAdvice}</p>
             </div>
           </div>
        )}

        <div className="pt-8 border-t border-white/5 text-center">
           <p className="text-lg font-light text-white/80 italic font-display">
             "{result.reassuranceLine}"
           </p>
        </div>

        {/* Feedback Section */}
        <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Was this helpful?</p>
          <div className="flex gap-4">
             <button
               onClick={() => setFeedback('up')}
               disabled={feedback !== null}
               className={`p-3 rounded-xl border transition-all duration-300 ${
                 feedback === 'up' 
                   ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                   : feedback === 'down' 
                     ? 'opacity-30 border-transparent text-gray-600'
                     : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
               }`}
               aria-label="Helpful"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
               </svg>
             </button>
             <button
               onClick={() => setFeedback('down')}
               disabled={feedback !== null}
               className={`p-3 rounded-xl border transition-all duration-300 ${
                 feedback === 'down' 
                   ? 'bg-red-500/20 border-red-500/50 text-red-400 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                   : feedback === 'up' 
                     ? 'opacity-30 border-transparent text-gray-600'
                     : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
               }`}
               aria-label="Not Helpful"
             >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
               </svg>
             </button>
          </div>
          {feedback && (
            <span className="text-xs text-emerald-400 animate-fade-in font-medium">Thank you for your feedback</span>
          )}
        </div>

      </div>
    </div>
  );
};

export default OutputDisplay;