import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  userProfile: UserProfile;
  t: any; // Translations
  compact?: boolean; // If true, simpler button
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, userProfile, t, compact = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs for speech recognition to handle lifecycle
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = userProfile.language; // Set language based on profile

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
            setError(t.voice.permissionError || "Microphone denied");
        } else {
            setError(t.voice.error);
        }
        setTimeout(() => setError(null), 3000);
      };

      recognitionRef.current = recognition;
    }
  }, [userProfile.language, onTranscript, t.voice.error]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Browser not supported");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className={`relative inline-block ${compact ? '' : 'w-full'}`}>
      <button
        onClick={toggleListening}
        className={`
          relative z-10 flex items-center justify-center transition-all duration-300
          ${compact 
            ? `w-10 h-10 rounded-full ${isListening ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'}`
            : `w-full py-4 rounded-xl font-bold border ${isListening 
                ? 'bg-red-500/10 border-red-500/50 text-red-500 animate-pulse' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`
          }
        `}
      >
        {isListening ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-current rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-100"></span>
            <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-200"></span>
            {!compact && <span className="ml-2">{t.voice.listening}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className={`w-5 h-5 ${compact ? '' : 'mr-1'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {!compact && <span>{t.voice.tapToSpeak}</span>}
          </div>
        )}
      </button>
      
      {/* Ripple Effect when Listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-full animate-ping bg-red-500/20 opacity-75"></span>
      )}

      {/* Error Message */}
      {error && !compact && (
        <div className="absolute top-full mt-2 w-full text-center text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;