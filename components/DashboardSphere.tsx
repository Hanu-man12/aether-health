
import React, { useState, useEffect } from 'react';
import { ElementType, UserProfile } from '../types';
import { ELEMENTS } from '../constants';

interface SanctuaryHomeProps {
  onSelect: (el: ElementType) => void;
  userProfile: UserProfile;
  t: any;
  logoSrc: string;
}

const DashboardSphere: React.FC<SanctuaryHomeProps> = ({ onSelect, userProfile, t, logoSrc }) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<ElementType | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Configuration for positioning elements in the "Cockpit" view
  // Coordinates are in percentages (x, y)
  const POSITIONS: Record<string, { x: number; y: number }> = {
    [ElementType.SPACE]: { x: 50, y: 35 }, // Center Hub
    [ElementType.FIRE]: { x: 20, y: 75 }, // Left Outer
    [ElementType.EARTH]: { x: 38, y: 65 }, // Left Inner
    [ElementType.WATER]: { x: 62, y: 65 }, // Right Inner
    [ElementType.AIR]: { x: 80, y: 75 }, // Right Outer
  };

  const SATELLITES = [ElementType.FIRE, ElementType.EARTH, ElementType.WATER, ElementType.AIR];

  const getGlowColor = (el: ElementType) => {
    switch (el) {
      case ElementType.FIRE: return 'shadow-[0_20px_60px_-10px_rgba(245,158,11,0.5)] border-amber-500/30';
      case ElementType.EARTH: return 'shadow-[0_20px_60px_-10px_rgba(16,185,129,0.5)] border-emerald-500/30';
      case ElementType.WATER: return 'shadow-[0_20px_60px_-10px_rgba(6,182,212,0.5)] border-cyan-500/30';
      case ElementType.AIR: return 'shadow-[0_20px_60px_-10px_rgba(255,255,255,0.4)] border-white/30';
      default: return '';
    }
  };

  const getGradientText = (el: ElementType) => {
     switch (el) {
      case ElementType.FIRE: return 'text-amber-400';
      case ElementType.EARTH: return 'text-emerald-400';
      case ElementType.WATER: return 'text-cyan-400';
      case ElementType.AIR: return 'text-slate-200';
      default: return 'text-white';
    }
  }

  return (
    <div className="relative w-full h-full min-h-screen bg-[#050505] overflow-hidden flex flex-col font-sans selection:bg-cyan-500/30">
      
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Horizon Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-gradient-to-t from-cyan-900/10 via-violet-900/5 to-transparent opacity-60 rounded-[100%] blur-3xl transform translate-y-1/2 scale-x-150"></div>
        {/* Starfield / Noise */}
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-20 pt-12 pb-6 text-center animate-fade-in">
        <h1 className="text-4xl lg:text-5xl font-serif text-white tracking-wide drop-shadow-2xl mb-3">
          The Sanctuary
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">
               System Status: Optimal
             </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
             <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
             <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
               Neural Link Active
             </span>
          </div>
        </div>
      </div>

      {/* --- ORBITAL WORKSPACE --- */}
      <div className="relative flex-1 w-full max-w-[1600px] mx-auto z-10 hidden lg:block">
        
        {/* SVG CONNECTIONS LAYER */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {SATELLITES.map((el, i) => {
            const start = POSITIONS[ElementType.SPACE]; // Center
            const end = POSITIONS[el]; // Satellite
            return (
              <g key={el}>
                {/* Glow Line */}
                <line 
                  x1={`${start.x}%`} y1={`${start.y}%`} 
                  x2={`${end.x}%`} y2={`${end.y}%`} 
                  stroke={hoveredStation === el ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.05)"} 
                  strokeWidth={hoveredStation === el ? "2" : "1"}
                  className="transition-all duration-500 ease-out"
                />
                {/* Moving Pulse Particle */}
                <circle r="2" fill="white" className="opacity-0 animate-flow-particle">
                  <animateMotion 
                    dur={`${2 + i * 0.5}s`} 
                    repeatCount="indefinite"
                    path={`M${start.x * window.innerWidth / 100},${start.y * window.innerHeight / 100} L${end.x * window.innerWidth / 100},${end.y * window.innerHeight / 100}`}
                  />
                </circle>
              </g>
            )
          })}
        </svg>

        {/* --- CENTRAL HUB (SPACE) --- */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
          style={{ left: `${POSITIONS[ElementType.SPACE].x}%`, top: `${POSITIONS[ElementType.SPACE].y}%` }}
          onClick={() => onSelect(ElementType.SPACE)}
          onMouseEnter={() => setHoveredStation(ElementType.SPACE)}
          onMouseLeave={() => setHoveredStation(null)}
        >
           <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Outer Rings */}
              <div className="absolute inset-0 rounded-full border border-white/5 animate-spin-slow opacity-50"></div>
              <div className="absolute inset-4 rounded-full border border-white/5 animate-spin-slow opacity-30" style={{ animationDirection: 'reverse' }}></div>
              
              {/* Main Sphere */}
              <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[inset_0_0_60px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_100px_rgba(139,92,246,0.3)] transition-all duration-700 animate-breathe-slow flex items-center justify-center overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-radial from-violet-500/10 to-transparent opacity-50"></div>
                 <img src={logoSrc} alt="System Core" className="w-32 h-32 object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
              </div>

              {/* Label */}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center opacity-60 group-hover:opacity-100 transition-opacity">
                 <div className="text-[10px] font-mono text-violet-300 uppercase tracking-[0.3em] mb-1">Central Hub</div>
                 <div className="text-lg font-serif text-white">System Synthesis</div>
              </div>
           </div>
        </div>

        {/* --- SATELLITES --- */}
        {SATELLITES.map((el, index) => {
          const config = ELEMENTS[el];
          const isHovered = hoveredStation === el;
          const pos = POSITIONS[el];
          
          return (
            <div
              key={el}
              className={`
                absolute transform -translate-x-1/2 -translate-y-1/2 z-30
                transition-all duration-500 ease-out
                ${isHovered ? '-translate-y-[calc(50%+20px)] scale-105' : ''}
              `}
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transitionDelay: `${index * 50}ms` }}
              onClick={() => onSelect(el)}
              onMouseEnter={() => setHoveredStation(el)}
              onMouseLeave={() => setHoveredStation(null)}
            >
               {/* Glass Card */}
               <div className={`
                 relative w-48 h-72 rounded-3xl
                 bg-white/[0.03] backdrop-blur-md
                 border border-white/10
                 flex flex-col items-center justify-between p-6
                 overflow-hidden
                 transition-all duration-500
                 ${isHovered ? getGlowColor(el) : 'hover:border-white/20'}
               `}>
                  {/* Elemental Bloom (Bottom) */}
                  <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${config.gradientFrom} to-transparent opacity-20 ${isHovered ? 'opacity-60' : ''} transition-opacity duration-500 blur-xl pointer-events-none`}></div>

                  {/* Top Icon */}
                  <div className={`
                    w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center
                    transition-all duration-300 ${isHovered ? 'scale-110 bg-white/10' : ''}
                  `}>
                     <config.icon className={`w-6 h-6 ${isHovered ? 'text-white' : config.textAccent}`} />
                  </div>

                  {/* Vertical Line Deco */}
                  <div className="h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent my-4"></div>

                  {/* Bottom Text */}
                  <div className="text-center z-10">
                     <div className={`text-xl font-display font-bold mb-1 transition-colors ${isHovered ? getGradientText(el) : 'text-white/80'}`}>
                       {t.elements[el].name}
                     </div>
                     <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                       {t.elements[el].tagline}
                     </div>
                  </div>
               </div>
            </div>
          )
        })}
      </div>

      {/* --- MOBILE LIST VIEW (Fallback) --- */}
      <div className="lg:hidden flex-1 px-6 pb-20 overflow-y-auto space-y-4 pt-8">
         {/* Space Card */}
         <div 
           onClick={() => onSelect(ElementType.SPACE)}
           className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-6 active:scale-95 transition-transform"
         >
            <div className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
               <img src={logoSrc} className="w-10 h-10 object-contain opacity-80" alt="Core" />
            </div>
            <div>
               <h3 className="text-xl font-serif text-white">System Synthesis</h3>
               <p className="text-xs text-violet-300 uppercase tracking-widest mt-1">Central Hub</p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
           {SATELLITES.map((el) => {
             const config = ELEMENTS[el];
             return (
               <div 
                 key={el}
                 onClick={() => onSelect(el)}
                 className="aspect-[3/4] rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 flex flex-col items-center justify-between active:scale-95 transition-transform"
               >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <config.icon className={`w-5 h-5 ${config.textAccent}`} />
                  </div>
                  <div className="text-center">
                     <div className="text-sm font-bold text-white mb-1">{t.elements[el].name}</div>
                     <div className="text-[8px] text-white/40 uppercase">{t.elements[el].tagline}</div>
                  </div>
               </div>
             )
           })}
         </div>
      </div>

    </div>
  );
};

export default DashboardSphere;
    