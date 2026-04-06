import React from 'react';
import { ElementType } from '../types';
import { ELEMENTS } from '../constants';

interface DashboardGridProps {
  onSelect: (el: ElementType) => void;
  t: any; // Translations
}

const DashboardGrid: React.FC<DashboardGridProps> = ({ onSelect, t }) => {
  const elementsList = Object.values(ELEMENTS);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {elementsList.map((el) => {
        const Icon = el.icon;
        // Get localized text if available, fallback to config
        const loc = t.elements[el.id];
        
        return (
          <button
            key={el.id}
            onClick={() => onSelect(el.id)}
            className="group relative overflow-hidden rounded-3xl p-1 text-left transition-all duration-300 hover:scale-[1.02] focus:outline-none"
          >
            {/* Gradient Border Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${el.gradientFrom} ${el.gradientTo} opacity-20 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
            
            {/* Inner Card Content */}
            <div className="relative h-full bg-[#151A25] rounded-[22px] p-6 border border-white/5 hover:border-white/10 transition-colors flex flex-col justify-between overflow-hidden">
               
               {/* Subtle gradient overlay inside */}
               <div className={`absolute inset-0 bg-gradient-to-br ${el.gradientFrom} ${el.gradientTo} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

               <div>
                 <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${el.textAccent}`}>
                   <Icon className="w-6 h-6" />
                 </div>
                 
                 <h3 className="text-xl font-bold text-white mb-2 font-display">{loc.name}</h3>
                 <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{loc.tagline}</p>
                 <p className="text-sm text-gray-400 leading-relaxed mb-6">{loc.description}</p>
               </div>

               <div className="flex items-center gap-2 text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                 <span>Launch Module</span>
                 <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                 </svg>
               </div>
            </div>
          </button>
        );
      })}

      {/* Coming Soon Card */}
      <div className="relative rounded-3xl p-6 border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-75 transition-opacity cursor-default">
         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
           <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
           </svg>
         </div>
         <h3 className="text-lg font-bold text-gray-400 mb-1 font-display">Coming Soon</h3>
         <p className="text-xs text-gray-600">More elements in development</p>
      </div>
    </div>
  );
};

export default DashboardGrid;