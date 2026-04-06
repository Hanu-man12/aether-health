import React from 'react';

interface TrustPanelProps {
  reasoning?: string;
  emotionalTone?: string;
  className?: string;
  t: any; // Translations
}

const TrustPanel: React.FC<TrustPanelProps> = ({ reasoning, emotionalTone, className, t }) => {
  if (!reasoning && !emotionalTone) return null;

  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-white/5 rounded-lg">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
           <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-display">{t.trustEngine}</h3>
           <p className="text-[10px] text-gray-500">{t.realTime}</p>
        </div>
      </div>

      <div className="space-y-6">
        {emotionalTone && (
          <div className="animate-fade-in">
            <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">{t.emotionalTone}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 capitalize">
              <span className={`w-2 h-2 rounded-full ${
                emotionalTone.toLowerCase().includes('fear') || emotionalTone.toLowerCase().includes('panic') 
                  ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                  : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
              }`}></span>
              {emotionalTone}
            </div>
          </div>
        )}

        {reasoning && (
          <div className="animate-fade-in delay-100">
            <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">{t.logicSummary}</p>
            <div className="text-sm text-gray-400 leading-relaxed font-light italic pl-3 border-l-2 border-white/10">
              "{reasoning}"
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-white/5">
         <div className="flex flex-col gap-2 items-center text-center">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">{t.safetyProtocols}</p>
            <p className="text-xs text-gray-500">
              {t.safetyDesc}
            </p>
         </div>
      </div>
    </div>
  );
};

export default TrustPanel;