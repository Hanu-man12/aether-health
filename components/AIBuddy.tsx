import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

interface AIBuddyProps {
  onTranscript: (text: string) => void;
  userProfile: UserProfile;
  t: any;
  feedbackMsg: string | null;
  loading: boolean;
  isPlayingAudio: boolean;
  buddyResponse?: string | null;
  onClearResponse?: () => void;
}

const AIBuddy: React.FC<AIBuddyProps> = ({ 
  onTranscript, 
  userProfile, 
  t, 
  feedbackMsg, 
  loading,
  isPlayingAudio,
  buddyResponse,
  onClearResponse
}) => {
  const [isListening, setIsListening] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [buddyState, setBuddyState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  
  const recognitionRef = useRef<any>(null);

  // Sync state with props
  useEffect(() => {
    if (loading) {
      setBuddyState('thinking');
    } else if (isPlayingAudio) {
      setBuddyState('speaking');
    } else if (isListening) {
      setBuddyState('listening');
    } else {
      setBuddyState('idle');
    }
  }, [loading, isPlayingAudio, isListening]);

  // Sync feedback message (transient updates)
  useEffect(() => {
    if (feedbackMsg) {
      setLocalMessage(feedbackMsg);
      const timer = setTimeout(() => setLocalMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = userProfile.language;

      recognition.onstart = () => {
        setIsListening(true);
        // Only set message if not just "listening" generic prompt, or keep it null to rely on visuals
        setLocalMessage(null); 
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
           setLocalMessage(t.voice.permissionError || "Microphone access denied.");
        } else {
           setLocalMessage(t.voice.error);
        }
        setTimeout(() => setLocalMessage(null), 3000);
      };

      recognitionRef.current = recognition;
    }
  }, [userProfile.language, onTranscript, t]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setLocalMessage("Voice not supported");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClearResponse) onClearResponse();
    setLocalMessage(null);
  };

  const displayContent = buddyResponse || localMessage;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Bubble (Only for output or errors, not for "Listening..." status) */}
      {displayContent && (
        <div className="mb-4 mr-2 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl rounded-tr-sm shadow-xl max-w-xs md:max-w-sm animate-slide-up pointer-events-auto relative group">
          {onClearResponse && buddyResponse && (
             <button 
               onClick={handleClear}
               className="absolute top-2 right-2 text-gray-400 hover:text-white bg-black/20 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
             >
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          )}
          <p className="text-sm font-medium text-white leading-relaxed">{displayContent}</p>
        </div>
      )}

      {/* Buddy Orb */}
      <button 
        onClick={toggleListening}
        className={`pointer-events-auto relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 focus:outline-none ${
          buddyState === 'thinking' ? 'animate-bounce' : ''
        }`}
      >
        {/* Breathing Halo (Listening State) */}
        {buddyState === 'listening' && (
           <>
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-50"></div>
              <div className="absolute inset-[-8px] rounded-full border border-white/10 animate-pulse opacity-30"></div>
           </>
        )}

        {/* Core Glow */}
        <div className={`absolute inset-0 rounded-full blur-md transition-all duration-700 ${
          buddyState === 'listening' ? 'bg-red-500/40 scale-110' : 
          buddyState === 'thinking' ? 'bg-violet-500/50 scale-110' :
          buddyState === 'speaking' ? 'bg-emerald-500/50 scale-125' :
          'bg-blue-500/20 hover:bg-blue-500/30'
        }`}></div>

        {/* Outer Ring */}
        <div className={`absolute inset-0 border rounded-full transition-all duration-700 ${
          buddyState === 'listening' ? 'border-red-400/50 scale-100' :
          buddyState === 'thinking' ? 'border-violet-400 border-double animate-ping' :
          buddyState === 'speaking' ? 'border-emerald-400 animate-pulse' :
          'border-white/10'
        }`}></div>

        {/* Inner Orb */}
        <div className={`relative w-12 h-12 rounded-full shadow-inner flex items-center justify-center overflow-hidden backdrop-blur-sm border transition-colors duration-700 ${
           buddyState === 'listening' ? 'bg-gradient-to-br from-red-500/80 to-rose-700/80 border-red-300/50' :
           buddyState === 'thinking' ? 'bg-gradient-to-br from-violet-500 to-fuchsia-700 border-violet-300' :
           buddyState === 'speaking' ? 'bg-gradient-to-br from-emerald-500 to-teal-700 border-emerald-300' :
           'bg-gradient-to-br from-white/10 to-white/5 border-white/20 group-hover:bg-white/10'
        }`}>
           {/* Face / Icon */}
           {buddyState === 'listening' ? (
             // Subtle Waveform Ring representation implies listening
             <div className="w-4 h-4 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]"></div>
           ) : buddyState === 'thinking' ? (
             <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
             </svg>
           ) : buddyState === 'speaking' ? (
             <div className="flex gap-0.5 items-center justify-center h-4">
               <div className="w-1 bg-white animate-wave rounded-full h-full"></div>
               <div className="w-1 bg-white animate-wave rounded-full h-3 animation-delay-100"></div>
               <div className="w-1 bg-white animate-wave rounded-full h-4 animation-delay-200"></div>
             </div>
           ) : (
             <svg className="w-6 h-6 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
           )}
        </div>
      </button>
      
      {/* Help Label (Only shows when idle and no message) */}
      {!displayContent && buddyState === 'idle' && (
        <span className="mt-2 text-[9px] font-medium text-white/30 uppercase tracking-[0.2em] pointer-events-auto transition-opacity hover:text-white/60">
          Assistant
        </span>
      )}
    </div>
  );
};

export default AIBuddy;