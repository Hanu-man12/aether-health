import React, { useState } from 'react';
import { UserProfile, Language, Tone, HealthStatus } from '../types';

interface SettingsPanelProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  onClose: () => void;
  t: any; // Translations
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ profile, onUpdate, onClose, t }) => {
  const [localName, setLocalName] = useState(profile.name);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'zh', label: '中文' },
    { code: 'ja', label: '日本語' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'bn', label: 'বাংলা' }
  ];

  const statuses: { code: HealthStatus; label: string; color: string }[] = [
    { code: 'calm', label: 'Calm', color: 'bg-emerald-500' },
    { code: 'active', label: 'Active', color: 'bg-amber-500' },
    { code: 'focused', label: 'Focused', color: 'bg-indigo-500' }
  ];

  const handleSave = () => {
    onUpdate({ ...profile, name: localName });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-md bg-[#1C1C1E] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-serif text-white">Personal Sanctuary</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          {/* Identity Section */}
          <div className="space-y-4">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Identity</label>
             <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xl font-serif text-white">
                  {localName.charAt(0)}
                </div>
                <div className="flex-1">
                   <input 
                     type="text" 
                     value={localName}
                     onChange={(e) => setLocalName(e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors"
                     placeholder="Your Name"
                   />
                </div>
             </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Status</label>
            <div className="grid grid-cols-3 gap-2">
               {statuses.map(s => (
                 <button
                   key={s.code}
                   onClick={() => onUpdate({ ...profile, status: s.code })}
                   className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                     profile.status === s.code 
                       ? 'bg-white/10 border-white/30' 
                       : 'bg-white/5 border-transparent hover:bg-white/10'
                   }`}
                 >
                    <div className={`w-3 h-3 rounded-full ${s.color}`}></div>
                    <span className="text-xs font-medium text-gray-300">{s.label}</span>
                 </button>
               ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.language}</label>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onUpdate({ ...profile, language: lang.code })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    profile.language === lang.code
                      ? 'bg-mineral-900 text-white border border-mineral-500/50'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Response */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.voiceResponse}</label>
            <button
              onClick={() => onUpdate({ ...profile, voiceResponse: !profile.voiceResponse })}
              className={`w-full py-3 rounded-xl flex items-center justify-between px-6 transition-all ${
                profile.voiceResponse
                  ? 'bg-copper-900/30 border border-copper-500/30 text-copper-100'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className="font-medium text-sm">{profile.voiceResponse ? 'Active' : 'Muted'}</span>
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${profile.voiceResponse ? 'bg-copper-500' : 'bg-gray-600'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${profile.voiceResponse ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>
          </div>

        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;