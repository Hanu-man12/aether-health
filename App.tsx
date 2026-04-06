import React, { useState, useRef, useEffect } from 'react';
import { ElementType, AnalysisResult, UserProfile, HealthStatus } from './types';
import { ELEMENTS } from './constants';
import { TRANSLATIONS } from './translations';
import { generateAetherResponse, routeVoiceIntent, generateVoiceAudio, getBuddyResponse, generateAppLogo } from './services/geminiService';
import SanctuaryHome from './components/DashboardSphere'; // Renamed conceptually
import OutputDisplay from './components/OutputDisplay';
import TrustPanel from './components/TrustPanel';
import SettingsPanel from './components/SettingsPanel';
import LandingPage from './components/LandingPage';
import SpaceDashboard from './components/SpaceDashboard';
import VitalScanModule from './components/VitalScanModule';
import ClearScriptModule from './components/ClearScriptModule';
import HydroGuardModule from './components/HydroGuardModule';
import TrueMedsModule from './components/TrueMedsModule'; // New Module
import AIBuddy from './components/AIBuddy';

type ViewState = 'LANDING' | 'DASHBOARD' | 'MODULE';

// Audio Decode Helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LANDING');
  const [currentElement, setCurrentElement] = useState<ElementType | null>(null);
  
  // Logo State
  const [logoSrc, setLogoSrc] = useState<string>('/app-logo.png');

  // Generate Logo on Mount
  useEffect(() => {
    const fetchLogo = async () => {
      // Check session storage to avoid regenerating on every reload
      const cached = sessionStorage.getItem('aether_logo');
      if (cached) {
        setLogoSrc(cached);
        return;
      }

      // Generate new logo
      const generated = await generateAppLogo();
      if (generated) {
        setLogoSrc(generated);
        sessionStorage.setItem('aether_logo', generated);
      }
    };
    
    fetchLogo();
  }, []);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex',
    status: 'calm',
    language: 'en',
    tone: 'calm',
    voiceResponse: true,
    accessibility: { largeText: false }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [buddyResponse, setBuddyResponse] = useState<string | null>(null);

  // Input & Results State
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Global Result Map for Context
  const [results, setResults] = useState<Record<ElementType, { data: AnalysisResult, timestamp: number } | null>>({
    [ElementType.FIRE]: null,
    [ElementType.WATER]: null,
    [ElementType.AIR]: null,
    [ElementType.EARTH]: null,
    [ElementType.SPACE]: null,
  });

  // Global Voice State
  const [isRoutingVoice, setIsRoutingVoice] = useState(false);
  
  // TTS State
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Translation Helper
  const t = TRANSLATIONS[userProfile.language];

  // Helper to get current result
  const currentResult = currentElement ? results[currentElement]?.data || null : null;
  const currentResultObj = currentElement ? results[currentElement] : null;

  const handleElementSelect = (el: ElementType) => {
    setCurrentElement(el);
    setView('MODULE');
    
    // Clear transient inputs
    setInputText('');
    setSelectedImage(null);
    setError(null);
    stopAudio();
    setAudioBase64(null);
    setBuddyResponse(null); // Clear buddy chat on nav
  };

  const handleBack = () => {
    setView('DASHBOARD');
    setCurrentElement(null);
    stopAudio();
    setAudioBase64(null);
    setBuddyResponse(null);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setFeedbackMsg(TRANSLATIONS[newProfile.language].updated);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Content = base64String.split(',')[1];
        setSelectedImage(base64Content);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGlobalVoiceInput = async (transcript: string) => {
    if (!transcript) return;
    setIsRoutingVoice(true);
    setFeedbackMsg(t.voice.processing);
    setBuddyResponse(null);

    try {
      const routingResult = await routeVoiceIntent(transcript, userProfile);
      
      if (routingResult.action === 'NAVIGATE_DASHBOARD') {
        setFeedbackMsg("Navigating to Dashboard...");
        setTimeout(() => setFeedbackMsg(null), 3000);
        handleBack();
      } else if (routingResult.action === 'NAVIGATE_ELEMENT' && routingResult.targetElement) {
        setFeedbackMsg(`${t.voice.routed} ${t.elements[routingResult.targetElement].name}`);
        setTimeout(() => setFeedbackMsg(null), 3000);
        handleElementSelect(routingResult.targetElement);
        setInputText(transcript);
      } else if (routingResult.action === 'EXPLAIN') {
         const explanation = await getBuddyResponse(transcript, userProfile);
         setBuddyResponse(explanation);
         
         if (userProfile.voiceResponse) {
             const audio = await generateVoiceAudio(explanation, ElementType.SPACE); 
             if (audio) {
                 setAudioBase64(audio);
                 playAudio(audio);
             }
         }
      } else {
         setFeedbackMsg("I didn't quite get that command.");
         setTimeout(() => setFeedbackMsg(null), 2000);
      }

    } catch (err) {
      console.error(err);
      setFeedbackMsg(t.voice.error);
    } finally {
      setIsRoutingVoice(false);
    }
  };

  const playAudio = async (base64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const bytes = decode(base64);
      const buffer = audioContextRef.current.createBuffer(1, bytes.length / 2, 24000);
      const channelData = buffer.getChannelData(0);
      const dataInt16 = new Int16Array(bytes.buffer);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      sourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio playback error", e);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleClear = () => {
    setInputText('');
    setSelectedImage(null);
    setError(null);
    stopAudio();
    setAudioBase64(null);
    if (currentElement) {
       setResults(prev => ({
         ...prev,
         [currentElement]: null
       }));
    }
  };

  const handleAction = async (overrideInput?: string) => {
    if (!currentElement) return;

    // Safety Check: Ensure overrideInput is a string or undefined.
    // React events are objects, which can cause circular JSON errors if passed through.
    const safeOverrideInput = typeof overrideInput === 'string' ? overrideInput : undefined;

    setLoading(true);
    setError(null);
    stopAudio();
    setAudioBase64(null);
    setBuddyResponse(null);

    const inputToUse = safeOverrideInput || inputText;

    try {
      let contextData = {};
      if (currentElement === ElementType.SPACE) {
         contextData = (Object.keys(results) as ElementType[]).reduce((acc, key) => {
            const val = results[key];
            if (key !== ElementType.SPACE && val) {
              acc[key] = val.data;
            }
            return acc;
         }, {} as any);
      }

      const response = await generateAetherResponse(
        currentElement, 
        inputToUse, 
        userProfile,
        selectedImage || undefined,
        contextData
      );
      
      setResults(prev => ({
        ...prev,
        [currentElement]: { data: response, timestamp: Date.now() }
      }));

      if (userProfile.voiceResponse) {
        // Safe access to properties and ensure string
        let textToSpeak = response.reassuranceLine || "";
        if (response.safetyAdvice) textToSpeak += ". " + response.safetyAdvice;
        if (response.whatThisMeans) textToSpeak = response.whatThisMeans + ". " + textToSpeak;
        
        // Truncate to avoid issues and ensure we have a string to check length on
        if (textToSpeak && textToSpeak.length > 300) {
          textToSpeak = textToSpeak.substring(0, 300) + "...";
        }

        if (textToSpeak) {
          const audio = await generateVoiceAudio(textToSpeak, currentElement);
          if (audio) {
            setAudioBase64(audio);
            playAudio(audio);
          }
        }
      }
    } catch (err) {
      setError("Aether could not complete the analysis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentConfig = currentElement ? ELEMENTS[currentElement] : null;
  const currentLoc = currentConfig ? t.elements[currentConfig.id] : null;

  if (view === 'LANDING') {
    return (
      <LandingPage 
        onEnter={() => setView('DASHBOARD')} 
        onLaunchElement={handleElementSelect}
        t={t}
        logoSrc={logoSrc}
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-white/20 ${userProfile.accessibility.largeText ? 'text-lg' : ''} bg-sanctuary-wall text-sanctuary-light transition-colors duration-1000 ease-in-out`}>
      {/* Deep Grounding Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none z-0"></div>

      {/* USER IDENTITY LAYER (Top Right) */}
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <button 
          onClick={() => setShowSettings(true)}
          className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full pl-2 pr-5 py-2 border border-white/5 hover:border-white/10 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
        >
           <div className="relative">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-serif text-white border border-white/5 group-hover:border-white/20 transition-colors">
               {userProfile.name.charAt(0)}
             </div>
             <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1C1C1E] ${
               userProfile.status === 'calm' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' :
               userProfile.status === 'active' ? 'bg-amber-400' : 'bg-copper-500'
             }`}></div>
           </div>
           <div className="text-left flex flex-col justify-center">
             <div className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-tight">{userProfile.name}</div>
             <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-tight group-hover:text-gray-400">Profile</div>
           </div>
        </button>
      </div>

      {/* BRAND (Top Left) - UPDATED WITH DYNAMIC LOGO */}
      <div className="fixed top-6 left-6 z-50 cursor-pointer animate-fade-in" onClick={handleBack}>
         <div className="group relative hover:scale-105 transition-transform duration-300">
             <div className="h-12 w-auto flex items-center overflow-hidden rounded-full border border-white/10 bg-black/20">
                <img 
                  src={logoSrc} 
                  alt={t.appTitle}
                  className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                />
             </div>
         </div>
      </div>

      {showSettings && (
        <SettingsPanel 
          profile={userProfile} 
          onUpdate={handleUpdateProfile} 
          onClose={() => setShowSettings(false)} 
          t={t}
        />
      )}

      {/* GLOBAL AI BUDDY */}
      <AIBuddy 
        onTranscript={handleGlobalVoiceInput}
        userProfile={userProfile}
        t={t}
        feedbackMsg={feedbackMsg}
        loading={loading || isRoutingVoice}
        isPlayingAudio={isPlaying}
        buddyResponse={buddyResponse}
        onClearResponse={() => setBuddyResponse(null)}
      />

      <main className="w-full h-full relative z-10">
        
        {/* VIEW: DASHBOARD (SANCTUARY HOME) */}
        {view === 'DASHBOARD' && (
          <SanctuaryHome 
            onSelect={handleElementSelect} 
            userProfile={userProfile}
            t={t}
            logoSrc={logoSrc}
          />
        )}

        {/* VIEW: MODULE (EXISTING UI - Refined for Sanctuary Theme) */}
        {view === 'MODULE' && currentConfig && currentLoc && (
          <>
            {/* SPECIAL MODULE VIEW FOR VITALSCAN (FIRE) */}
            {currentElement === ElementType.FIRE ? (
              <VitalScanModule 
                onBack={handleBack}
                onAnalyze={handleAction}
                result={currentResultObj}
                loading={loading}
                error={error}
                t={t}
                userProfile={userProfile}
              />
            ) : currentElement === ElementType.AIR ? (
              /* SPECIAL MODULE VIEW FOR CLEARSCRIPT (AIR) */
              <ClearScriptModule
                onBack={handleBack}
                onImageUpload={handleImageUpload}
                onAnalyze={() => handleAction()} 
                result={currentResultObj}
                selectedImage={selectedImage}
                loading={loading}
                error={error}
                t={t}
              />
            ) : currentElement === ElementType.WATER ? (
              /* SPECIAL MODULE VIEW FOR HYDROGUARD (WATER) */
              <HydroGuardModule
                onBack={handleBack}
                onAnalyze={() => handleAction()}
                result={currentResultObj}
                loading={loading}
                error={error}
                t={t}
              />
            ) : currentElement === ElementType.EARTH ? (
              /* SPECIAL MODULE VIEW FOR TRUEMEDS (EARTH) */
              <TrueMedsModule
                onBack={handleBack}
                onImageUpload={handleImageUpload}
                onAnalyze={() => handleAction()}
                result={currentResultObj}
                selectedImage={selectedImage}
                loading={loading}
                error={error}
                t={t}
              />
            ) : (
              /* STANDARD LAYOUT FOR OTHER MODULES (Fallback) */
              <div className="animate-fade-in min-h-screen pt-24 px-6 max-w-7xl mx-auto flex flex-col pb-20">
                
                {/* Module Header */}
                {currentElement !== ElementType.SPACE && (
                  <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-6">
                    <button 
                      onClick={handleBack}
                      className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
                      <span className="text-xs font-bold uppercase tracking-widest">{t.backToDashboard}</span>
                    </button>
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    <h2 className="text-2xl font-serif text-white">
                      {currentLoc.name}
                    </h2>
                    
                    {audioBase64 && (
                      <div className="ml-auto flex items-center gap-2">
                         {isPlaying ? (
                           <button onClick={stopAudio} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors">
                             <span className="animate-pulse">●</span> {t.voice.mute}
                           </button>
                         ) : (
                           <button onClick={() => playAudio(audioBase64)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-emerald-500/30 transition-colors">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                             {t.voice.replay}
                           </button>
                         )}
                      </div>
                    )}
                  </div>
                )}

                {currentElement === ElementType.SPACE ? (
                  <>
                   <div className="mb-6 flex justify-start">
                       <button 
                          onClick={handleBack}
                          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" /></svg>
                          <span className="text-xs font-bold uppercase tracking-widest">{t.backToDashboard}</span>
                        </button>
                   </div>
                   <SpaceDashboard 
                      results={results}
                      onAskLifeLoop={(input) => handleAction(input)}
                      loading={loading}
                      t={t}
                   />
                  </>
                ) : (
                  /* Standard Layout for Fallbacks */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
                    
                    {/* LEFT: Input Column (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3 mb-6">
                            <div className={`p-2 rounded-lg bg-sanctuary-floor text-white border border-white/5`}>
                              <currentConfig.icon className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.inputLabel}</div>
                          </div>

                          <div className="space-y-6">
                            {currentConfig.inputType === 'text' && (
                              <div className="space-y-3">
                                <textarea
                                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none h-48 text-sm leading-relaxed"
                                  placeholder={currentLoc.placeholder}
                                  value={inputText}
                                  onChange={(e) => setInputText(e.target.value)}
                                />
                              </div>
                            )}

                            {currentConfig.inputType === 'image' && (
                              <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                    className="hidden" 
                                    id="image-upload" 
                                  />
                                <label htmlFor="image-upload" className="block cursor-pointer">
                                  <div className="border border-dashed border-white/10 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-all">
                                      {selectedImage ? (
                                        <div className="relative rounded-lg overflow-hidden h-32 w-full">
                                          <img src={`data:image/png;base64,${selectedImage}`} alt="Upload" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-xs text-white">{t.changeImage}</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-center">
                                          <svg className="w-6 h-6 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                          <span className="text-xs font-medium text-gray-500">{t.uploadPhoto}</span>
                                        </div>
                                      )}
                                  </div>
                                </label>
                              </div>
                            )}

                            {currentConfig.inputType === 'mock_action' && (
                              <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                <p className="text-sm text-gray-500 italic">{t.initSim}</p>
                              </div>
                            )}

                            <div className="flex items-stretch gap-3">
                              {currentConfig.inputType !== 'mock_action' && (
                                <button
                                  onClick={handleClear}
                                  disabled={loading || (!inputText && !selectedImage)}
                                  className="px-4 rounded-xl font-bold text-gray-500 bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                  title="Clear Input"
                                >
                                  <span className="hidden md:inline text-[10px] uppercase tracking-widest">Reset</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleAction()}
                                disabled={loading || (currentConfig.inputType === 'text' && !inputText) || (currentConfig.inputType === 'image' && !selectedImage)}
                                className={`
                                  flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                  bg-gradient-to-r from-mineral-500 to-mineral-900
                                  hover:brightness-110
                                `}
                              >
                                {loading ? (
                                  <div className="flex items-center justify-center gap-2">
                                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                      <span className="text-xs uppercase tracking-widest">{t.thinking}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs uppercase tracking-widest">{t.analyze}</span>
                                )}
                              </button>
                            </div>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                          </div>
                      </div>
                    </div>

                    {/* CENTER: Output Column (6 cols) */}
                    <div className="lg:col-span-6">
                      {currentResult ? (
                        <OutputDisplay element={currentElement} result={currentResult} t={t} />
                      ) : (
                        <div className="h-full min-h-[400px] rounded-2xl flex flex-col items-center justify-center text-center p-8 border border-white/5 bg-white/[0.02]">
                          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                              <currentConfig.icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <h3 className="text-lg text-gray-400 font-serif mb-2">{t.readyForAnalysis}</h3>
                          <p className="text-gray-600 text-sm max-w-xs mx-auto">
                            {t.readyDesc}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT: Trust Column (3 cols) */}
                    <div className="lg:col-span-3">
                      <TrustPanel 
                        emotionalTone={currentResult?.emotionalState} 
                        reasoning={currentResult?.reasoningSummary}
                        t={t}
                      />
                    </div>

                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
};

export default App;