import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { WaterIcon } from '../constants';

interface HydroGuardModuleProps {
  onBack: () => void;
  onAnalyze: () => void;
  result: { data: AnalysisResult, timestamp: number } | null;
  loading: boolean;
  error: string | null;
  t: any;
}

const HydroGuardModule: React.FC<HydroGuardModuleProps> = ({
  onBack,
  onAnalyze,
  result,
  loading,
  error,
  t
}) => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [dataFlows, setDataFlows] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    if (loading) {
      setSimulationActive(true);
      setDataFlows(true);
      setTerminalLogs(["INITIALIZING_GRID..."]);
      
      const interval = setInterval(() => {
        const actions = [
          "FETCHING_SENSOR_DATA...", "PINGING_RESERVOIR_NODES...", "ANALYZING_PH_LEVELS...", 
          "CHECKING_TURBIDITY_INDICES...", "CROSS_REFERENCING_WEATHER_DATA...", 
          "SYNCING_MUNICIPAL_RECORDS...", "DETECTING_PATHOGEN_MARKERS..."
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        setTerminalLogs(prev => [`[${timestamp}] ${randomAction}`, ...prev].slice(0, 6));
      }, 300);

      return () => clearInterval(interval);

    } else if (result) {
      setDataFlows(false);
    }
  }, [loading, result]);

  const handleStartSim = () => {
    onAnalyze();
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 md:px-10 max-w-[1600px] mx-auto flex flex-col h-screen animate-fade-in text-slate-300">
      
      {/* --- COMMAND HEADER --- */}
      <div className="flex items-center justify-between mb-6 border-b border-blue-900/30 pb-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors uppercase text-[10px] font-bold tracking-[0.2em]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            System Exit
          </button>
          <div className="h-6 w-px bg-slate-800"></div>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
               <WaterIcon className="w-5 h-5 text-blue-400" />
             </div>
             <div>
                <h1 className="text-xl font-display font-bold text-white tracking-tight">HYDRO-GUARD v2.5</h1>
                <p className="text-[9px] text-blue-500/60 uppercase tracking-[0.2em]">Environmental Intelligence Grid</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Global Status</span>
              <span className="text-xs font-mono text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                LIVE_FEED_STABLE
              </span>
           </div>
           <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded text-[10px] font-mono text-blue-400">
             LAT: 37.7749 / LON: -122.4194
           </div>
        </div>
      </div>

      {/* --- MAIN INTERFACE GRID --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT/CENTRAL: DOMINANT VISUALIZATION (OSM MAP) */}
        <div className="lg:col-span-8 relative flex flex-col bg-slate-950 rounded-xl border border-blue-900/20 overflow-hidden shadow-2xl">
          
          {/* MAP CONTAINER */}
          <div className="absolute inset-0 z-0">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              scrolling="no" 
              marginHeight={0} 
              marginWidth={0} 
              src="https://www.openstreetmap.org/export/embed.html?bbox=-122.45%2C37.75%2C-122.38%2C37.80&amp;layer=mapnik"
              className={`w-full h-full opacity-40 grayscale contrast-125 invert brightness-75 transition-all duration-1000 ${simulationActive ? 'blur-[1px] scale-105' : ''}`}
            ></iframe>
          </div>

          {/* DYNAMIC OVERLAYS */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* Flowing Data Particles */}
            {dataFlows && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-blue-400/20 rounded-full blur-sm animate-flow-particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${Math.random() * 4 + 2}px`,
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${Math.random() * 5}s`,
                      animationDuration: `${Math.random() * 3 + 2}s`
                    }}
                  ></div>
                ))}
              </div>
            )}

            {/* Scanning Radar */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[80%] h-[80%] border border-blue-500/10 rounded-full animate-ping opacity-20"></div>
                 <div className="absolute w-[40%] h-[40%] border border-blue-500/20 rounded-full animate-pulse"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent animate-scan-line"></div>
              </div>
            )}

            {/* Result Nodes (Appears when result is ready) */}
            {result && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full border-4 animate-ping opacity-50 ${result.data.waterQualityRisk === 'High' ? 'border-red-500' : result.data.waterQualityRisk === 'Moderate' ? 'border-amber-500' : 'border-emerald-500'}`}></div>
                  <div className={`absolute top-0 left-0 w-8 h-8 rounded-full border shadow-lg flex items-center justify-center ${result.data.waterQualityRisk === 'High' ? 'bg-red-500/20 border-red-500' : result.data.waterQualityRisk === 'Moderate' ? 'bg-amber-500/20 border-amber-500' : 'bg-emerald-500/20 border-emerald-500'}`}>
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MAP HUD OVERLAYS */}
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-4">
            <div className="p-3 bg-slate-900/80 backdrop-blur-md border border-blue-900/30 rounded-lg shadow-xl">
               <div className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mb-2">Sensor Matrix</div>
               <div className="flex gap-1.5 h-1 items-end">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`w-2 rounded-full transition-all duration-300 ${simulationActive ? 'bg-blue-400' : 'bg-slate-700'}`} style={{ height: `${Math.random() * 100}%` }}></div>
                  ))}
               </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 z-20 w-full max-w-sm">
             <div className="p-4 bg-slate-950/90 backdrop-blur-md border border-blue-900/20 rounded-lg">
                <p className="text-[10px] font-mono text-blue-400 mb-1 border-b border-white/5 pb-1 flex justify-between">
                   <span>SYSTEM_LOG</span>
                   {loading && <span className="animate-pulse">●</span>}
                </p>
                <div className="font-mono text-[10px] text-slate-400 leading-relaxed italic h-24 overflow-hidden flex flex-col justify-end">
                  {loading ? (
                    terminalLogs.map((log, i) => (
                      <div key={i} className="opacity-80">{log}</div>
                    ))
                  ) : result ? (
                    result.data.reassuranceLine
                  ) : (
                    "Awaiting simulation initialization sequence..."
                  )}
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT: CONTROLS & INTELLIGENCE REPORT (40%) */}
        <div className="lg:col-span-4 flex flex-col gap-6 min-h-0">
           
           {/* CONTROL PANEL */}
           <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl shadow-xl">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
                Control Interface
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              </h3>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                   <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500">
                      <span>Source Depth</span>
                      <span className="text-blue-400">12.4m</span>
                   </div>
                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-500">
                      <span>Grid Load</span>
                      <span className="text-blue-400">Low</span>
                   </div>
                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[20%]"></div>
                   </div>
                </div>

                <button 
                  onClick={handleStartSim}
                  disabled={loading}
                  className={`
                    w-full py-5 rounded-lg font-display font-bold uppercase tracking-[0.3em] text-xs transition-all duration-700 relative overflow-hidden group
                    ${loading 
                      ? 'bg-blue-950 text-blue-800 cursor-wait' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]'
                    }
                  `}
                >
                  <span className="relative z-10">{loading ? 'Simulating Matrix...' : 'Initialize Simulation'}</span>
                  {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>}
                </button>
              </div>
           </div>

           {/* REPORT PANEL */}
           <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex flex-col min-h-0 shadow-inner overflow-hidden">
              <div className="p-4 border-b border-slate-900 bg-slate-900/30 flex justify-between items-center">
                 <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Environmental Report</h3>
                 {result && (
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                     result.data.waterQualityRisk === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                   }`}>
                     LVL: {result.data.waterQualityRisk}
                   </span>
                 )}
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                {!result && !loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                     <WaterIcon className="w-12 h-12 mb-4" />
                     <p className="text-xs uppercase tracking-widest">Standby for Local Data</p>
                  </div>
                ) : loading ? (
                  <div className="space-y-4">
                     <div className="h-4 bg-slate-900 rounded w-full animate-pulse"></div>
                     <div className="h-4 bg-slate-900 rounded w-[90%] animate-pulse"></div>
                     <div className="h-24 bg-slate-900 rounded w-full animate-pulse mt-8"></div>
                  </div>
                ) : result ? (
                  <div className="animate-fade-in space-y-6">
                     <div className="p-5 rounded-lg bg-blue-500/5 border border-blue-500/10 shadow-inner">
                        <p className="text-sm leading-relaxed text-slate-300 font-light italic">
                          "{result.data.reportSummary}"
                        </p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Interpretation</span>
                           <p className="text-xs text-slate-400 leading-relaxed border-l border-blue-500/30 pl-3">
                             {result.data.whatThisMeans}
                           </p>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
                           <span className="text-[9px] text-blue-400 uppercase font-bold tracking-widest block mb-2">Public Safety Guidance</span>
                           <p className="text-sm text-slate-200 font-serif leading-relaxed">
                             {result.data.safetyAdvice}
                           </p>
                        </div>
                     </div>
                  </div>
                ) : null}
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-900 text-center">
                 <p className="text-[9px] text-slate-700 uppercase tracking-widest font-mono">
                   Data Integrity: SECURE • GRID_ALPHA_9
                 </p>
              </div>
           </div>
        </div>

      </div>

      <style>{`
        @keyframes flow-particle {
          0% { transform: translateY(-50px) scale(0.5); opacity: 0; }
          20% { opacity: 0.5; }
          80% { opacity: 0.2; }
          100% { transform: translateY(400px) scale(1.2); opacity: 0; }
        }
        .animate-flow-particle {
          animation-name: flow-particle;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .animate-scan-line {
          animation: scan-line 4s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HydroGuardModule;