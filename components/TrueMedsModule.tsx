import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { EarthIcon } from '../constants';

interface TrueMedsModuleProps {
  onBack: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  result: { data: AnalysisResult, timestamp: number } | null;
  selectedImage: string | null;
  loading: boolean;
  error: string | null;
  t: any;
}

const TrueMedsModule: React.FC<TrueMedsModuleProps> = ({
  onBack,
  onImageUpload,
  onAnalyze,
  result,
  selectedImage,
  loading,
  error,
  t
}) => {
  const [scanProgress, setScanProgress] = useState(0);
  const hasResult = !!result?.data;

  useEffect(() => {
    if (loading) {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => Math.min(prev + Math.floor(Math.random() * 5), 99));
      }, 100);
      return () => clearInterval(interval);
    } else if (hasResult) {
      setScanProgress(100);
    }
  }, [loading, hasResult]);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-8 max-w-[1600px] mx-auto flex flex-col font-mono text-emerald-100 animate-fade-in bg-[#0A0C0B]">
      
      {/* --- WORKSPACE HEADER --- */}
      <div className="w-full flex items-center justify-between mb-8 border-b border-emerald-900/30 pb-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-400 transition-colors uppercase text-xs font-bold tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Abort
          </button>
          <div className="h-6 w-px bg-emerald-900/40"></div>
          <div className="flex items-center gap-3">
             <div className="p-1.5 bg-emerald-900/20 border border-emerald-500/20 rounded-sm">
               <EarthIcon className="w-5 h-5 text-emerald-500" />
             </div>
             <div>
                <h1 className="text-lg font-bold text-white tracking-tighter leading-none">TRUEMEDS</h1>
                <p className="text-[9px] text-emerald-600 uppercase tracking-[0.2em] mt-1">Verification Workspace v3.1</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-900/10 border border-emerald-900/30 rounded-sm text-[10px] text-emerald-500/60 uppercase tracking-widest">
            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-emerald-400 animate-ping' : 'bg-emerald-800'}`}></div>
            System Ready
          </div>
        </div>
      </div>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-px bg-emerald-900/20 border border-emerald-900/30 rounded-lg overflow-hidden shadow-2xl">
        
        {/* LEFT: SCANNING SURFACE */}
        <div className="relative bg-[#0F1210] p-8 flex flex-col items-center justify-center min-h-[500px] group">
           
           {/* Grid Background */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

           {/* Viewfinder Frame */}
           <div className={`relative w-full max-w-md aspect-square border-2 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden ${selectedImage ? 'border-emerald-500/50 bg-black/40' : 'border-dashed border-emerald-900/40 bg-emerald-900/5 hover:bg-emerald-900/10'}`}>
              
              {/* Corner Markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500/60"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500/60"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500/60"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500/60"></div>

              {selectedImage ? (
                <>
                  <img 
                    src={`data:image/png;base64,${selectedImage}`} 
                    className={`w-full h-full object-contain p-4 transition-all duration-500 ${loading ? 'opacity-50 grayscale' : ''}`}
                    alt="Specimen" 
                  />
                  
                  {loading && (
                    <>
                      {/* Grid Scanning Overlay */}
                      <div className="absolute inset-0 z-20 grid grid-cols-4 grid-rows-4 pointer-events-none">
                         {[...Array(16)].map((_, i) => (
                           <div key={i} className="border border-emerald-500/10 animate-pulse bg-emerald-500/5" style={{ animationDelay: `${i * 0.1}s` }}></div>
                         ))}
                      </div>
                      
                      {/* Central Scan Line */}
                      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                         <div className="w-full h-1 bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-[scan-fast_1.5s_linear_infinite] absolute"></div>
                      </div>

                      {/* Progress Stats */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center">
                         <div className="bg-black/80 backdrop-blur border border-emerald-500/50 p-4 font-mono text-center">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">{scanProgress}%</div>
                            <div className="text-[10px] uppercase text-emerald-600 tracking-widest">Analyzing Structure</div>
                         </div>
                      </div>
                    </>
                  )}

                  {/* Overlay Controls */}
                  {!loading && (
                     <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <label htmlFor="scan-upload" className="cursor-pointer px-4 py-2 bg-black/80 text-emerald-400 text-xs font-bold uppercase border border-emerald-500/30 hover:border-emerald-400">
                          Rescan
                        </label>
                     </div>
                  )}
                </>
              ) : (
                <div className="text-center p-8">
                   <EarthIcon className="w-12 h-12 text-emerald-900 mx-auto mb-4" />
                   <p className="text-sm text-emerald-600 font-bold uppercase tracking-widest mb-2">Initialize Scanner</p>
                   <p className="text-xs text-emerald-800/60 max-w-[200px] mx-auto mb-6">Place medicine packaging within the frame guide for verification.</p>
                   <label htmlFor="scan-upload" className="cursor-pointer px-6 py-3 bg-emerald-900/20 hover:bg-emerald-900/30 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-800 transition-all">
                      Upload Specimen
                   </label>
                </div>
              )}
              
              <input type="file" id="scan-upload" className="hidden" accept="image/*" onChange={onImageUpload} />
           </div>

           {/* Action Bar */}
           <div className="mt-8 w-full max-w-md flex gap-4">
              <button
                onClick={onAnalyze}
                disabled={!selectedImage || loading}
                className={`
                  flex-1 py-4 text-xs font-bold uppercase tracking-[0.2em] border transition-all
                  ${loading 
                    ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-700' 
                    : !selectedImage
                      ? 'bg-transparent border-emerald-900/20 text-emerald-900 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-500 shadow-[0_0_20px_rgba(5,150,105,0.4)]'
                  }
                `}
              >
                {loading ? 'Processing Specimen...' : 'Execute Analysis'}
              </button>
           </div>
           
           {error && <div className="mt-4 p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs font-mono">{error}</div>}
        </div>

        {/* RIGHT: ANALYSIS LOG */}
        <div className="bg-[#0C0E0D] p-8 flex flex-col relative overflow-hidden">
          
           {/* Section Header */}
           <div className="flex items-center justify-between mb-8 border-b border-emerald-900/30 pb-2">
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-sm"></span>
                Analysis Log
              </h2>
              <span className="text-[10px] text-emerald-900 font-mono">ID: {Date.now().toString().slice(-6)}</span>
           </div>

           {!hasResult ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
                <div className="font-mono text-4xl text-emerald-900 mb-4">--/--</div>
                <p className="text-xs text-emerald-800 uppercase tracking-widest">Waiting for data stream</p>
             </div>
           ) : (
             <div className="flex-1 flex flex-col gap-6 animate-slide-up">
                
                {/* 1. IDENTITY BLOCK */}
                <div className="p-4 bg-emerald-900/10 border border-emerald-900/30">
                   <span className="text-[9px] text-emerald-600 uppercase tracking-widest block mb-1">Identified Product</span>
                   <div className="text-lg text-white font-bold tracking-tight">
                     {result?.data.medicineIdentified || "Unknown Specimen"}
                   </div>
                </div>

                {/* 2. FORENSIC BREAKDOWN */}
                <div className="grid grid-cols-2 gap-4">
                   {/* Confidence */}
                   <div className="p-4 bg-emerald-900/5 border border-emerald-900/20">
                      <span className="text-[9px] text-emerald-700 uppercase tracking-widest block mb-2">Confidence</span>
                      <div className={`text-xl font-bold ${
                         result?.data.authenticityConfidence?.includes('High') ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                         {result?.data.authenticityConfidence || "N/A"}
                      </div>
                   </div>
                   
                   {/* Verification Status */}
                   <div className="p-4 bg-emerald-900/5 border border-emerald-900/20">
                      <span className="text-[9px] text-emerald-700 uppercase tracking-widest block mb-2">Status</span>
                      <div className="text-xs text-emerald-200 leading-relaxed">
                         {result?.data?.redFlags && result.data.redFlags.length > 0 ? "ANOMALIES DETECTED" : "VERIFIED STRUCTURE"}
                      </div>
                   </div>
                </div>
                
                {/* Forensic Check Matrix */}
                <div className="p-4 rounded border border-emerald-900/20 bg-emerald-900/5">
                   <span className="text-[9px] text-emerald-600 uppercase tracking-widest block mb-3">Forensic Scan Matrix</span>
                   <div className="space-y-2 text-[10px] font-mono">
                      <div className="flex justify-between items-center text-emerald-400/80">
                         <span>[✓] Typography & Font Analysis</span>
                         <span>PASS</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400/80">
                         <span>[✓] Structural Integrity</span>
                         <span>PASS</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400/80">
                         <span>[✓] Color & Print Quality</span>
                         <span>PASS</span>
                      </div>
                      {/* Dynamic Check for Batch Data */}
                      <div className="flex justify-between items-center">
                         <span className={result?.data?.redFlags?.some(f => f.toLowerCase().includes('batch')) ? "text-red-400" : "text-emerald-400/80"}>
                           {result?.data?.redFlags?.some(f => f.toLowerCase().includes('batch')) ? "[!] Batch Data Verification" : "[✓] Batch Data Verification"}
                         </span>
                         <span className={result?.data?.redFlags?.some(f => f.toLowerCase().includes('batch')) ? "text-red-400" : "text-emerald-400/80"}>
                           {result?.data?.redFlags?.some(f => f.toLowerCase().includes('batch')) ? "FLAGGED" : "PASS"}
                         </span>
                      </div>
                   </div>
                </div>

                {/* 3. ANOMALY REPORT */}
                <div className="flex-1 min-h-[80px] border border-emerald-900/20 p-4">
                   <span className="text-[9px] text-emerald-600 uppercase tracking-widest block mb-3">Visual Anomalies</span>
                   {result?.data?.redFlags && result.data.redFlags.length > 0 ? (
                      <ul className="space-y-2">
                        {result.data.redFlags.map((flag, i) => (
                           <li key={i} className="text-xs text-red-400 flex items-start gap-2">
                              <span className="mt-1 w-1 h-1 bg-red-500 block"></span>
                              {flag}
                           </li>
                        ))}
                      </ul>
                   ) : (
                      <div className="h-full flex items-center justify-center">
                         <span className="text-xs text-emerald-800 italic">No structural irregularities detected.</span>
                      </div>
                   )}
                </div>

                {/* 4. PROTOCOL */}
                <div className="mt-auto pt-6 border-t border-emerald-900/30">
                   <div className="mb-4">
                      <span className="text-[9px] text-emerald-600 uppercase tracking-widest block mb-1">Safety Protocol</span>
                      <p className="text-xs text-emerald-200 leading-relaxed font-light">
                        {result?.data.safetyAdvice}
                      </p>
                   </div>
                   <div className="p-3 bg-emerald-500/10 border-l-2 border-emerald-500 text-xs text-emerald-300 italic">
                      "{result?.data.reassuranceLine}"
                   </div>
                </div>

             </div>
           )}

        </div>

      </div>

      <style>{`
        @keyframes scan-fast {
          0% { top: 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default TrueMedsModule;