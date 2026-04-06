import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { AirIcon } from '../constants';

interface ClearScriptModuleProps {
  onBack: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  result: { data: AnalysisResult, timestamp: number } | null;
  selectedImage: string | null;
  loading: boolean;
  error: string | null;
  t: any;
}

const PROCESSING_STEPS = [
  "Enhancing image contrast...",
  "Isolating handwriting strokes...",
  "Analyzing vertical ascenders (t, l, h)...",
  "Decoding medical shorthand (Sig codes)...",
  "Cross-referencing pharmacopoeia...",
  "Synthesizing patient instructions..."
];

const ClearScriptModule: React.FC<ClearScriptModuleProps> = ({
  onBack,
  onImageUpload,
  onAnalyze,
  result,
  selectedImage,
  loading,
  error,
  t
}) => {
  const [hoveredMed, setHoveredMed] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const hasResult = !!result?.data;

  useEffect(() => {
    if (loading) {
      setCurrentStep(0);
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1000); 
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col animate-fade-in text-cyan-50">
      
      {/* --- DESK HEADER --- */}
      <div className="w-full flex items-center justify-between mb-8 border-b border-cyan-900/30 pb-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-cyan-400/60 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7 7-7" /></svg>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Exit Desk</span>
          </button>
          <div className="h-4 w-px bg-cyan-900/40"></div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
               <AirIcon className="w-4 h-4 text-cyan-400" />
             </div>
             <div>
                <h1 className="text-xl font-serif text-white leading-none">ClearScript</h1>
                <p className="text-[9px] text-cyan-500/60 uppercase tracking-widest mt-1">Forensic Handwriting Decoder</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {loading && (
             <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
               <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
               <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Processing Script</span>
             </div>
           )}
           {hasResult && !loading && (
             <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
               Deciphering Complete
             </div>
           )}
        </div>
      </div>

      {/* --- INTERPRETATION AREA --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: DOCUMENT SLOT (40%) */}
        <div className="lg:col-span-5 sticky top-24">
           <div className="group relative aspect-[3/4] bg-[#0F1315] rounded-2xl border border-cyan-900/30 shadow-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500 hover:border-cyan-500/30">
              
              {selectedImage ? (
                <>
                  <img 
                    src={`data:image/png;base64,${selectedImage}`} 
                    className={`w-full h-full object-cover transition-all duration-700 ${loading ? 'blur-sm grayscale opacity-50' : 'blur-0 grayscale-0 opacity-80'}`} 
                    alt="Prescription"
                  />
                  
                  {/* Scanning Line Animation */}
                  {loading && (
                    <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                       <div className="w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-[scan_2s_ease-in-out_infinite] absolute"></div>
                       {/* Simulate stroke detection points */}
                       {[...Array(5)].map((_,i) => (
                          <div key={i} className="absolute w-8 h-8 border border-cyan-400/50 rounded-full animate-ping" style={{ top: `${Math.random()*80}%`, left: `${Math.random()*80}%`, animationDelay: `${i*0.5}s` }}></div>
                       ))}
                    </div>
                  )}

                  {/* Highlight Overlays (Simulated visual linking) */}
                  {hasResult && !loading && hoveredMed !== null && (
                    <div className="absolute inset-0 bg-cyan-400/5 mix-blend-overlay animate-pulse pointer-events-none"></div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                     <label htmlFor="desk-upload" className="cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold py-3 rounded-xl text-center transition-all">
                        Replace Document
                     </label>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center flex flex-col items-center">
                   <div className="w-20 h-20 rounded-full bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center mb-6">
                      <svg className="w-8 h-8 text-cyan-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   </div>
                   <h3 className="text-lg font-serif text-white/80 mb-2">Insert Document</h3>
                   <p className="text-sm text-white/40 max-w-xs mb-8">Upload a photo of your prescription. The AI will decode bad handwriting, medical abbreviations, and dosage instructions.</p>
                   
                   <input type="file" id="desk-upload" className="hidden" accept="image/*" onChange={onImageUpload} />
                   <label htmlFor="desk-upload" className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full transition-all cursor-pointer shadow-lg shadow-cyan-900/20 uppercase tracking-widest text-xs">
                      Select Image
                   </label>
                </div>
              )}
           </div>

           {selectedImage && !hasResult && !loading && (
             <button 
               onClick={onAnalyze}
               className="w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-50 transition-all uppercase tracking-[0.2em] text-xs shadow-xl"
             >
               Initiate Handwriting Analysis
             </button>
           )}
           
           {error && <p className="mt-4 text-center text-red-400 text-xs">{error}</p>}
        </div>

        {/* RIGHT: DECODED EXPLANATION (60%) */}
        <div className="lg:col-span-7 space-y-8 animate-fade-in pb-12">
          
          {loading && (
             <div className="h-[400px] border border-cyan-900/30 bg-[#0F1315] rounded-3xl flex flex-col items-center justify-center p-12">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-8 animate-pulse">Graphology Sequence Active</h3>
                <div className="space-y-6 w-full max-w-md">
                   {PROCESSING_STEPS.map((step, idx) => (
                      <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${idx <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                         <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                           idx < currentStep ? 'bg-cyan-500 border-cyan-500 text-black' : 
                           idx === currentStep ? 'bg-transparent border-cyan-500 text-cyan-500 animate-spin' :
                           'bg-transparent border-gray-600 text-gray-600'
                         }`}>
                            {idx < currentStep ? (
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            ) : idx === currentStep ? (
                              <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
                            ) : (
                              <span className="text-[10px]">{idx + 1}</span>
                            )}
                         </div>
                         <span className={`text-sm font-mono ${idx === currentStep ? 'text-white' : 'text-gray-400'}`}>{step}</span>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {!loading && !hasResult && (
             <div className="h-[400px] border border-dashed border-cyan-900/30 rounded-3xl flex items-center justify-center text-center p-12">
                <div>
                   <p className="text-cyan-500/40 font-mono text-sm mb-2">Waiting for data input...</p>
                   <p className="text-white/20 text-xs">Aether intelligence will identify strokes and expand Latin abbreviations (e.g. 'PO TID').</p>
                </div>
             </div>
          )}

          {!loading && hasResult && result && (
            <div className="space-y-8 animate-slide-up">
               
               {/* 1. OCR Summary */}
               <section>
                  <h3 className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.3em] mb-4">Raw Text Extraction</h3>
                  <div className="p-6 rounded-2xl bg-[#0F1315] border border-cyan-500/10 text-cyan-100/80 font-mono text-xs leading-relaxed shadow-inner">
                    <span className="text-cyan-500 select-none mr-2">&gt;</span>
                    {result.data.ocrInterpretation}
                  </div>
               </section>

               {/* 2. Decoded Medications */}
               <section>
                  <h3 className="text-[10px] font-bold text-cyan-500/60 uppercase tracking-[0.3em] mb-4">Interpreted Instructions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {result.data.medications?.map((med, idx) => (
                      <div 
                        key={idx}
                        onMouseEnter={() => setHoveredMed(idx)}
                        onMouseLeave={() => setHoveredMed(null)}
                        className={`
                          relative p-6 rounded-3xl border transition-all duration-300
                          ${hoveredMed === idx 
                            ? 'bg-cyan-500/10 border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.1)] -translate-x-2' 
                            : 'bg-white/5 border-white/5'}
                        `}
                      >
                         <div className="flex justify-between items-start mb-4">
                            <div>
                               <h4 className="text-2xl font-serif text-white mb-1">{med.name}</h4>
                               {/* Enhanced Tags for Dosage */}
                               <div className="flex flex-wrap gap-2 text-[10px] font-bold text-cyan-400/70 uppercase mt-1">
                                 <span className="bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/20">{med.dosage}</span>
                                 <span className="bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/20">{med.frequency}</span>
                                 {med.duration && <span className="bg-cyan-900/40 px-2 py-1 rounded border border-cyan-500/20">{med.duration}</span>}
                               </div>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                              med.confidence === 'High' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                            }`}>
                              {med.confidence} CONF.
                            </span>
                         </div>

                         <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-900/10 to-transparent border-l-2 border-cyan-500">
                            <strong className="text-[9px] text-cyan-500 uppercase block mb-1">Patient Instructions (Expanded)</strong>
                            <p className="text-sm text-white/90 leading-relaxed font-medium">
                               "{med.instructions}"
                            </p>
                         </div>
                      </div>
                    ))}
                  </div>
               </section>

               {/* 3. GRAPHOLOGY ANALYSIS */}
               {result.data.graphologyAnalysis && result.data.graphologyAnalysis.length > 0 && (
                  <section>
                    <h3 className="text-[10px] font-bold text-violet-400/80 uppercase tracking-[0.3em] mb-4">Forensic Graphology</h3>
                    <div className="bg-violet-900/10 border border-violet-500/20 rounded-2xl p-6">
                       <p className="text-xs text-violet-200/60 mb-4">
                          The AI reconstructed illegible strokes to deduce the medications.
                       </p>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {result.data.graphologyAnalysis.map((item, i) => (
                             <div key={i} className="p-3 bg-black/20 rounded-lg border border-white/5 space-y-2">
                                <div className="flex items-center justify-between">
                                   <div>
                                      <div className="text-[10px] uppercase text-gray-500 mb-0.5">Observed Stroke Pattern</div>
                                      <div className="text-xs text-gray-300 italic">"{item.observedStroke}"</div>
                                   </div>
                                   <div className="text-right">
                                      <div className="text-[10px] uppercase text-violet-400 mb-0.5">Decoded As</div>
                                      <div className="text-sm font-bold text-white">"{item.interpretedAs}"</div>
                                   </div>
                                </div>
                                {(item.strokePressure || item.slant) && (
                                  <div className="flex gap-2 mt-2 pt-2 border-t border-white/5">
                                    {item.strokePressure && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                        Pressure: {item.strokePressure}
                                      </span>
                                    )}
                                    {item.slant && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                        Slant: {item.slant}
                                      </span>
                                    )}
                                  </div>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>
                  </section>
               )}

               {/* 4. Safety & Reassurance */}
               <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                     <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Pharmacist Safety Note
                     </h4>
                     <p className="text-sm text-amber-200/80 leading-relaxed">
                        {result.data.safetyAdvice}
                     </p>
                     {result.data.verificationRequired && (
                        <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-[10px] text-red-200 font-bold uppercase tracking-wider text-center">
                           ⚠️ Human Verification Recommended
                        </div>
                     )}
                  </div>

                  <div className="p-6 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 flex flex-col justify-center">
                     <p className="text-lg font-serif italic text-white/80 text-center leading-relaxed">
                        "{result.data.reassuranceLine}"
                     </p>
                  </div>
               </section>

               {/* Ambiguity Warnings */}
               {result.data.ambiguityFlags && result.data.ambiguityFlags.length > 0 && (
                 <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Illegible Segments Flagged</h4>
                    <ul className="text-xs text-red-200/70 space-y-1 pl-4 list-disc">
                       {result.data.ambiguityFlags.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                 </div>
               )}

            </div>
          )}

        </div>

      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default ClearScriptModule;