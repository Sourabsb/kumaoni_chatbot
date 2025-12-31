import { useState } from 'react';

function MessageBubble({ message }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';
  const isError = message.isError;

  const handleSpeak = () => {
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.85;
      utterance.pitch = 0.95;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('hi-IN')) ||
        voices.find(v => v.lang.includes('en-IN')) ||
        voices[0];

      if (indianVoice) {
        utterance.voice = indianVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className={`flex w-full animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-lg ${isUser
          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-br-sm shadow-amber-500/20'
          : `bg-white/5 backdrop-blur-xl text-white border border-white/10 rounded-bl-sm ${isError ? 'border-red-500/50 text-red-400' : ''}`
          }`}
      >

        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0 break-words text-[15px] leading-relaxed font-medium">
            {message.content}
          </div>

          {!isUser && !isError && (
            <button
              className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${isSpeaking
                ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                : 'text-amber-200/50 hover:text-amber-100 hover:bg-white/10'
                }`}
              onClick={handleSpeak}
              title={isSpeaking ? 'Stop' : 'Listen'}
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                  <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Show details toggle for assistant messages */}
        {!isUser && message.englishMeaning && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <button
              className="text-xs font-semibold text-amber-200/50 hover:text-amber-200 flex items-center gap-1 transition-colors"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide details' : 'Show logic'}
              <span className="text-[10px]">{showDetails ? '▲' : '▼'}</span>
            </button>

            {showDetails && (
              <div className="mt-3 space-y-3 animate-fade-in text-xs md:text-sm">
                <div className="bg-white/5 backdrop-blur-xl p-3 rounded-xl border border-white/10">
                  <strong className="block text-xs uppercase tracking-wider text-amber-200/50 mb-1">English Meaning</strong>
                  <p className="text-amber-100 font-medium italic">{message.englishMeaning}</p>
                </div>

                {message.examples && message.examples.length > 0 && (
                  <div className="bg-white/5 backdrop-blur-xl p-3 rounded-xl border border-white/10">
                    <strong className="block text-xs uppercase tracking-wider text-amber-200/50 mb-2">Retrieved Examples</strong>
                    <div className="space-y-2">
                      {message.examples.slice(0, 3).map((ex, i) => (
                        <div key={i} className="flex flex-col gap-1 pb-2 border-b border-white/5 last:border-0 last:pb-0">
                          <span className="text-amber-200/60">{ex.english}</span>
                          <span className="text-amber-300 font-medium flex items-center gap-1">
                            <span className="text-[10px] opacity-50">⬇</span> {ex.kumaoni}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
