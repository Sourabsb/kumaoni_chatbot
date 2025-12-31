import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function InputBox({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setText(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [text]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const openVoiceChat = () => {
    navigate('/voice-chat');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
      <form
        className="max-w-3xl mx-auto flex items-end gap-3 bg-white/5 backdrop-blur-2xl p-2 pl-4 rounded-2xl border border-white/10 shadow-2xl"
        onSubmit={handleSubmit}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Kumaoni Chatbot..."
          disabled={disabled}
          rows={1}
          className="flex-1 max-h-48 py-3 bg-transparent text-white placeholder-amber-200/30 focus:outline-none resize-none text-[15px] leading-relaxed"
        />

        <div className="flex items-center gap-1 pb-1">
          {/* Mic button */}
          <button
            type="button"
            className={`p-2.5 rounded-full transition-all duration-200 ${isListening
              ? 'bg-red-500/30 text-red-400'
              : 'text-amber-200/50 hover:text-amber-100 hover:bg-white/10'
              }`}
            onClick={toggleListening}
            disabled={disabled}
            title="Voice input"
          >
            {isListening ? (
              <span className="relative flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
              </span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" x2="12" y1="19" y2="22"></line>
              </svg>
            )}
          </button>

          {/* Send button */}
          <button
            type="submit"
            className={`p-2.5 rounded-full transition-all duration-200 ${text.trim() && !disabled
              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 shadow-lg shadow-amber-500/30 hover:shadow-xl'
              : 'bg-white/5 text-amber-200/30 cursor-not-allowed'
              }`}
            disabled={disabled || !text.trim()}
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5"></path>
              <path d="M5 12l7-7 7 7"></path>
            </svg>
          </button>

          {/* Realtime Voice Chat button */}
          <button
            type="button"
            className="p-2.5 rounded-full transition-all duration-200 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 hover:from-amber-500/40 hover:to-orange-500/40 hover:text-amber-100 border border-amber-500/30 hover:border-amber-400/50"
            onClick={openVoiceChat}
            title="Realtime Voice Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h2"></path>
              <path d="M6 8v8"></path>
              <path d="M10 5v14"></path>
              <path d="M14 8v8"></path>
              <path d="M18 10v4"></path>
              <path d="M22 12h-2"></path>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default InputBox;
