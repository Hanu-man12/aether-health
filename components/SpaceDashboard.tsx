import React, { useState, useEffect } from 'react';
import { AnalysisResult, ElementType } from '../types';
import { ELEMENTS, SpaceIcon } from '../constants';

interface SpaceDashboardProps {
  results: Record<ElementType, { data: AnalysisResult, timestamp: number } | null>;
  onAskLifeLoop: (input: string) => void;
  loading: boolean;
  t: any;
}

const SpaceDashboard: React.FC<SpaceDashboardProps> = ({ results, onAskLifeLoop, loading, t }) => {
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [localInput, setLocalInput] = useState('');
  
  // Track if we are in a regeneration state (loading + existing data)
  const spaceData = results[ElementType.SPACE]?.data;
  const isRegenerating = loading && !!spaceData;
  const isInitialLoading = loading && !spaceData;

  // Determine if there is context from other elements
  const hasContext = Object.keys(results).some(
    (key) => key !== ElementType.SPACE && results[key as ElementType] !== null
  );

  // Auto-generate on first load if no data exists
  useEffect(() => {
    if (!spaceData && !loading) {
      onAskLifeLoop("Initial Dashboard Generation");
    }
  }, []); // Run once on mount

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  const handleSubmit = () => {
    if (localInput.trim()) {
      onAskLifeLoop(localInput);
      setLocalInput('');
      setIsInputOpen(false);
    }
  };

  const handleRegenerate = () => {
    onAskLifeLoop("Regenerate insights based on latest context");
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in text-white">
      
      {/* 1. HEADER SECTION */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Your Health in Context
          </h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="flex -space-x-2">
               {[ElementType.FIRE, ElementType.WATER, ElementType.AIR, ElementType.EARTH].map(el => (
                 <div key={el} className={`w-6 h-6 rounded-full border-2 border-[#0B0F17] flex items-center justify-center ${results[el] ? ELEMENTS[el].bg : 'bg-gray-800'}`}>
                    <div className={`w-2 h-2 rounded-full ${results[el] ? 'bg-white' : 'bg-gray-600'}`} />
                 </div>
               ))}
             </div>
             <span className="text-xs text-gray-500 ml-2">
               {hasContext ? "Data synced from modules" : "Waiting for module data..."}
             </span>
             {isRegenerating && (
                <span className="ml-4 text-xs font-bold text-violet-400 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full"/> Updating...
                </span>
             )}
          </div>
        </div>
        
        {/* Ask / Regenerate Actions */}
        <div className="flex gap-2">
          {spaceData && (
             <button
               onClick={handleRegenerate}
               disabled={loading}
               className={`flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all text-xs font-bold text-violet-300 uppercase tracking-wide ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                <svg className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Refreshing' : 'Regenerate'}
             </button>
          )}

          <button 
            onClick={() => setIsInputOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 rounded-full border border-violet-500/30 transition-all text-sm font-medium text-violet-200"
          >
            <SpaceIcon className="w-4 h-4" />
            <span>Ask LifeLoop</span>
          </button>
        </div>
      </header>

      {/* 2. HEALTH SNAPSHOT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[ElementType.FIRE, ElementType.WATER, ElementType.AIR, ElementType.EARTH].map(el => {
           const config = ELEMENTS[el];
           const res = results[el];
           const Icon = config.icon;
           
           let summary = "No data yet.";
           if (res) {
             if (el === ElementType.FIRE) summary = res.data.whatThisMeans || res.data.reassuranceLine;
             if (el === ElementType.WATER) summary = res.data.reportSummary || "Water analysis complete.";
             if (el === ElementType.AIR) summary = res.data.reassuranceLine || "Prescription processed.";
             if (el === ElementType.EARTH) summary = res.data.medicineIdentified ? `Identified: ${res.data.medicineIdentified}` : "Packaging verified.";
           }

           return (
             <div key={el} className={`p-4 rounded-2xl border border-white/5 bg-[#151A25] relative overflow-hidden group hover:border-${config.color.split('-')[1]}-500/30 transition-all`}>
                <div className={`absolute top-0 right-0 p-2 opacity-50`}>
                   <Icon className={`w-12 h-12 text-gray-800 group-hover:${config.textAccent} transition-colors opacity-20`} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                   <div className={`p-1.5 rounded-lg ${res ? config.bg : 'bg-gray-800'}`}>
                      <Icon className={`w-4 h-4 ${res ? config.color : 'text-gray-500'}`} />
                   </div>
                   <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{config.name}</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2 h-10 mb-2 leading-relaxed">
                  {res ? summary : <span className="text-gray-600 italic">Inactive</span>}
                </p>
                {res && <div className="text-[10px] text-gray-500 font-mono">{getTimeAgo(res.timestamp)}</div>}
             </div>
           )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
         
         {/* 3. GUIDED INSIGHTS (CENTER MAIN) - 2 Columns */}
         <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Context Card */}
            <div className={`p-8 rounded-3xl bg-gradient-to-br from-violet-900/10 to-fuchsia-900/10 border border-violet-500/20 shadow-lg relative overflow-hidden transition-all duration-500 ${isRegenerating ? 'opacity-70 grayscale-[0.3]' : 'opacity-100'}`}>
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-50"></div>
               {isRegenerating && <div className="absolute inset-0 bg-white/5 animate-pulse z-10 pointer-events-none"></div>}

               {isInitialLoading ? (
                 <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    {/* Orbital Loading Visual */}
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-2 border-violet-500/30 rounded-full animate-[spin_3s_linear_infinite]"></div>
                      <div className="absolute inset-2 border-2 border-fuchsia-500/30 rounded-full animate-[spin_4s_linear_infinite_reverse]"></div>
                      <div className="absolute inset-[35%] bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.5)]"></div>
                    </div>
                    <p className="text-violet-300 text-sm animate-pulse tracking-wide uppercase font-bold text-[10px]">Synthesizing Intelligence...</p>
                 </div>
               ) : spaceData ? (
                 <>
                   {/* Check if meaningful context exists before showing specific insights */}
                   {hasContext ? (
                      <>
                        <h3 className="text-xl font-display font-medium text-white mb-4">
                          {spaceData.dashboardContext || "Your health context is ready."}
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-3">What you can do today</h4>
                              <ul className="space-y-3">
                                {spaceData.actionableTips?.map((tip, i) => (
                                  <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 mt-1.5 shrink-0" />
                                    {tip}
                                  </li>
                                )) || <li className="text-gray-500 italic">No specific actions generated yet.</li>}
                              </ul>
                            </div>
                        </div>
                      </>
                   ) : (
                      /* Placeholder State when no context exists */
                      <div className="text-center py-8">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                           <SpaceIcon className="w-8 h-8 text-gray-600" />
                         </div>
                         <h3 className="text-xl font-display font-medium text-white mb-2">Connect Your Elements</h3>
                         <p className="text-gray-400 max-w-sm mx-auto mb-6">
                           Run VitalScan, TrueMeds, or other elements to allow LifeLoop to generate personalized health insights for you.
                         </p>
                      </div>
                   )}
                 </>
               ) : (
                 <div className="text-center py-12">
                   <p className="text-gray-500">Initializing LifeLoop...</p>
                 </div>
               )}
            </div>

            {/* 4. HOLISTIC WELLNESS STRIP (Generic or Specific) */}
            {spaceData && (
              <div className={`transition-opacity duration-500 ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Holistic Wellness</h4>
                 <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                   {spaceData.wellnessStrip?.map((item, i) => (
                      <div key={i} className="min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                         <div className="text-[10px] font-bold text-violet-400 uppercase mb-1">{item.type}</div>
                         <div className="font-semibold text-white mb-2">{item.title}</div>
                         <p className="text-xs text-gray-400 line-clamp-3">{item.instruction}</p>
                      </div>
                    ))}
                 </div>
              </div>
            )}
         </div>

         {/* 5. HEALTH NEWS FEED (RIGHT COL) - ALWAYS VISIBLE */}
         <div className="bg-[#0F131C] rounded-3xl p-6 border border-white/5 flex flex-col h-full min-h-[400px]">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 {hasContext ? "Personalized Feed" : "General Health Updates"}
              </span>
              {isRegenerating && <span className="text-[10px] text-gray-600">Updating...</span>}
            </h3>
            
            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
               {spaceData?.newsFeed ? (
                 spaceData.newsFeed.map((news, i) => (
                   <div key={i} className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
                      <div className="flex justify-between items-start mb-2">
                         <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                           {news.source}
                         </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-2 leading-snug group-hover:text-violet-300 transition-colors">
                        {news.headline}
                      </h4>
                      <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                        {news.summary}
                      </p>
                      {news.relevance && (
                        <div className="text-[10px] text-gray-500 border-t border-white/5 pt-2 italic">
                          Why: {news.relevance}
                        </div>
                      )}
                   </div>
                 ))
               ) : (
                 // Loading Skeleton for News Feed
                 [1, 2, 3].map(i => (
                   <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 animate-pulse">
                      <div className="h-3 w-16 bg-gray-700 rounded mb-3"></div>
                      <div className="h-4 w-3/4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-700 rounded mb-3"></div>
                      <div className="h-2 w-full bg-gray-800 rounded"></div>
                   </div>
                 ))
               )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-gray-600">
                Aether Health supports informed decisions, not diagnoses.
              </p>
            </div>
         </div>
      </div>

      {/* INPUT MODAL */}
      {isInputOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
           <div className="w-full max-w-lg bg-[#151A25] rounded-3xl border border-white/10 p-6 shadow-2xl animate-slide-up">
              <h3 className="text-lg font-display font-semibold text-white mb-4">Ask LifeLoop</h3>
              <textarea 
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Ask about your symptoms, wellness tips, or clarifying previous results..."
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 mb-4 h-32 resize-none"
                autoFocus
              />
              <div className="flex justify-between items-center pt-2">
                 <button 
                   onClick={() => setLocalInput('')}
                   disabled={!localInput}
                   className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-2 px-2 disabled:opacity-30 transition-colors"
                 >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                   <span>Clear Input</span>
                 </button>
                 <div className="flex gap-3">
                    <button 
                      onClick={() => setIsInputOpen(false)}
                      className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-violet-600 rounded-lg text-white font-semibold hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/20"
                    >
                      Ask
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default SpaceDashboard;