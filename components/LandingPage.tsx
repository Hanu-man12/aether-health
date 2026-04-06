import React, { useState, useEffect } from 'react';
import { ElementType } from '../types';
import { ELEMENTS } from '../constants';

interface LandingPageProps {
  onEnter: () => void;
  onLaunchElement: (el: ElementType) => void;
  t: any;
  logoSrc: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onLaunchElement, t, logoSrc }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Bento Grid Configuration
  const BENTO_ITEMS = [
    { 
      id: ElementType.FIRE, 
      title: "VitalScan",
      desc: "AI-powered symptom analysis grounded in WHO guidelines.",
      color: "text-amber-400",
      borderHover: "hover:border-amber-500/50",
      bgHover: "hover:bg-amber-500/5",
      shadowHover: "hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]",
      colSpan: "col-span-1 md:col-span-2"
    },
    { 
      id: ElementType.WATER, 
      title: "HydroGuard",
      desc: "Real-time community water safety mapping.",
      color: "text-blue-400",
      borderHover: "hover:border-blue-500/50",
      bgHover: "hover:bg-blue-500/5",
      shadowHover: "hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]",
      colSpan: "col-span-1 md:col-span-2"
    },
    { 
      id: ElementType.AIR, 
      title: "ClearScript",
      desc: "Decipher handwritten prescriptions instantly.",
      color: "text-cyan-400",
      borderHover: "hover:border-cyan-500/50",
      bgHover: "hover:bg-cyan-500/5",
      shadowHover: "hover:shadow-[0_0_30px_rgba(34,211,238,0.1)]",
      colSpan: "col-span-1 md:col-span-2"
    },
    { 
      id: ElementType.EARTH, 
      title: "TrueMeds",
      desc: "Detect counterfeit drugs via visual analysis.",
      color: "text-emerald-400",
      borderHover: "hover:border-emerald-500/50",
      bgHover: "hover:bg-emerald-500/5",
      shadowHover: "hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]",
      colSpan: "col-span-1 md:col-span-3"
    },
    { 
      id: ElementType.SPACE, 
      title: "LifeLoop",
      desc: "Universal translation & holistic health synthesis.",
      color: "text-violet-400",
      borderHover: "hover:border-violet-500/50",
      bgHover: "hover:bg-violet-500/5",
      shadowHover: "hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]",
      colSpan: "col-span-1 md:col-span-3"
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white overflow-y-auto overflow-x-hidden flex flex-col items-center font-sans selection:bg-teal-500/30">
      
      {/* --- 1. AURORA BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Noise Texture Overlay */}
         <div className="absolute inset-0 z-10 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>

         {/* Aurora Blobs */}
         <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-teal-900/30 rounded-full mix-blend-screen filter blur-[120px] animate-blob"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-amber-900/20 rounded-full mix-blend-screen filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
         <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] bg-indigo-900/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* --- 2. FLOATING WIDGETS --- */}
      <div className={`fixed top-12 left-8 md:left-12 z-20 hidden xl:block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
         <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg animate-float">
            <div className="flex items-center gap-3">
               <div className="relative w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </div>
               <div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">Active Nodes</div>
                  <div className="text-sm font-bold text-white font-mono">4,200</div>
               </div>
            </div>
         </div>
      </div>

      <div className={`fixed top-24 right-8 md:right-12 z-20 hidden xl:block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`} style={{ transitionDelay: '200ms' }}>
         <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center gap-3">
               <div className="flex items-end gap-0.5 h-4 w-4">
                  <div className="w-1 bg-cyan-400 rounded-t animate-wave h-[60%]"></div>
                  <div className="w-1 bg-cyan-400 rounded-t animate-wave h-[40%]" style={{ animationDelay: '100ms' }}></div>
                  <div className="w-1 bg-cyan-400 rounded-t animate-wave h-[80%]" style={{ animationDelay: '200ms' }}></div>
               </div>
               <div>
                  <div className="text-[9px] text-gray-400 uppercase tracking-widest font-mono">System Status</div>
                  <div className="text-sm font-bold text-white font-mono">OPTIMAL</div>
               </div>
            </div>
         </div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="relative z-30 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">

        {/* --- 3. HERO SECTION (Portal Visual) --- */}
        <div className={`flex flex-col items-center justify-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* THE PORTAL LOGO FIX */}
          <div 
            className="relative w-40 h-40 md:w-56 md:h-56 mb-10 group cursor-pointer perspective-container"
            onClick={onEnter}
          >
             {/* Orbital Rings */}
             <div className="absolute inset-[-24px] rounded-full border border-white/5 animate-spin-slow"></div>
             <div className="absolute inset-[-12px] rounded-full border border-white/5 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
             
             {/* Glass Sphere Container */}
             <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] ring-1 ring-white/20 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_60px_rgba(20,184,166,0.2)]">
                
                {/* Inner Gradient Reflection */}
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/30 to-transparent rounded-full blur-2xl opacity-60"></div>
                
                {/* Full Cover Image */}
                <img 
                  src={logoSrc} 
                  alt="Aether" 
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 scale-110 group-hover:scale-125"
                />
             </div>
          </div>

          {/* Headlines */}
          <h1 className="text-center mb-8 max-w-4xl mx-auto">
            <span className="block text-3xl md:text-5xl font-serif italic font-light text-white/80 mb-3 animate-fade-in">Harmonizing</span>
            <span className="block text-4xl md:text-7xl font-display font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-white to-emerald-400 drop-shadow-2xl animate-fade-in" style={{ animationDelay: '200ms' }}>
              Global Health
            </span>
          </h1>

          {/* Shiny Button CTA */}
          <button 
            onClick={onEnter}
            className="group relative px-12 py-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md overflow-hidden transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:scale-105 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
             <span className="relative z-10 font-mono text-xs font-bold text-white uppercase tracking-[0.2em] group-hover:text-teal-50 transition-colors">
               Initialize Sequence
             </span>
             {/* Button Shine */}
             <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer" />
          </button>

        </div>

        {/* --- 4. BENTO GRID FEATURES --- */}
        <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-4 animate-slide-up" style={{ animationDelay: '600ms' }}>
          {BENTO_ITEMS.map((item, idx) => {
            const config = ELEMENTS[item.id];
            const Icon = config.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onLaunchElement(item.id)}
                className={`
                  group relative flex flex-col justify-between p-6 md:p-8 rounded-3xl text-left
                  bg-white/5 backdrop-blur-md border border-white/10
                  transition-all duration-500 ease-out
                  ${item.colSpan}
                  ${item.borderHover} ${item.bgHover} ${item.shadowHover}
                  hover:-translate-y-1
                `}
                style={{ animationDelay: `${700 + (idx * 100)}ms` }}
              >
                {/* Header: Icon & Title */}
                <div className="flex justify-between items-start mb-4">
                   <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors ${item.color}`}>
                      <Icon className="w-6 h-6" />
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                      <svg className={`w-5 h-5 ${item.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                   </div>
                </div>

                {/* Content */}
                <div>
                   <h3 className="text-2xl font-serif font-medium text-white mb-2 group-hover:text-white transition-colors">
                     {item.title}
                   </h3>
                   <p className="text-sm text-gray-400 font-sans leading-relaxed group-hover:text-gray-300 transition-colors">
                     {item.desc}
                   </p>
                </div>

                {/* Subtle Gradient Glow inside Card */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
              </button>
            )
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-center animate-fade-in opacity-60" style={{ animationDelay: '1200ms' }}>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Responsible AI • Human-Centric Design</p>
        </div>

      </div>

    </div>
  );
};

export default LandingPage;