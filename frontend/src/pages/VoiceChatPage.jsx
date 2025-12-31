import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../services/api';

function VoiceChatPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, listening, processing, speaking
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [error, setError] = useState(null);
    const [turnCount, setTurnCount] = useState(0);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef(null);
    const transcriptRef = useRef('');
    const sessionIdRef = useRef(null);
    const statusRef = useRef('idle');
    const shouldContinueRef = useRef(true);

    useEffect(() => {
        sessionIdRef.current = sessionId;
    }, [sessionId]);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    const processAndRespond = async (text) => {
        if (!text || !text.trim()) {
            if (shouldContinueRef.current) {
                startListeningInternal();
            } else {
                setStatus('idle');
            }
            return;
        }

        setStatus('processing');
        setError(null);

        try {
            const result = await sendMessage(text.trim(), sessionIdRef.current);

            if (!sessionIdRef.current) {
                setSessionId(result.session_id);
            }

            setResponse(result.reply);
            setTurnCount(prev => prev + 1);
            speakResponse(result.reply);

        } catch (err) {
            console.error('API error:', err);
            setError('Failed to get response. Please try again.');
            if (shouldContinueRef.current) {
                setTimeout(() => startListeningInternal(), 2000);
            } else {
                setStatus('idle');
            }
        }
    };

    const speakResponse = (text) => {
        setStatus('speaking');
        synthRef.current.cancel();

        utteranceRef.current = new SpeechSynthesisUtterance(text);
        utteranceRef.current.lang = 'hi-IN';
        utteranceRef.current.rate = 0.9;
        utteranceRef.current.pitch = 1;

        const voices = synthRef.current.getVoices();
        const hindiVoice = voices.find(v => v.lang.includes('hi')) || voices[0];
        if (hindiVoice) {
            utteranceRef.current.voice = hindiVoice;
        }

        utteranceRef.current.onend = () => {
            if (shouldContinueRef.current) {
                setTranscript('');
                setResponse('');
                startListeningInternal();
            } else {
                setStatus('idle');
            }
        };

        utteranceRef.current.onerror = () => {
            if (shouldContinueRef.current) {
                startListeningInternal();
            } else {
                setStatus('idle');
            }
        };

        synthRef.current.speak(utteranceRef.current);
    };

    const startListeningInternal = () => {
        if (!recognitionRef.current) return;

        setStatus('listening');
        setTranscript('');
        transcriptRef.current = '';

        try {
            recognitionRef.current.start();
        } catch (err) {
            console.error('Recognition start error:', err);
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'hi-IN';

            recognition.onresult = (event) => {
                let fullTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    fullTranscript += event.results[i][0].transcript;
                }
                transcriptRef.current = fullTranscript;
                setTranscript(fullTranscript);
            };

            recognition.onend = () => {
                if (statusRef.current === 'listening' && transcriptRef.current.trim()) {
                    const textToProcess = transcriptRef.current.trim();
                    transcriptRef.current = '';
                    processAndRespond(textToProcess);
                } else if (statusRef.current === 'listening') {
                    if (shouldContinueRef.current) {
                        startListeningInternal();
                    } else {
                        setStatus('idle');
                    }
                }
            };

            recognition.onerror = (event) => {
                console.error('Recognition error:', event.error);
                if (event.error === 'no-speech') {
                    if (shouldContinueRef.current && statusRef.current === 'listening') {
                        setTimeout(() => startListeningInternal(), 500);
                    }
                } else if (event.error !== 'aborted') {
                    setError(`Error: ${event.error}`);
                }
            };

            recognitionRef.current = recognition;
        }

        synthRef.current.getVoices();
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = () => synthRef.current.getVoices();
        }

        return () => {
            shouldContinueRef.current = false;
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
            synthRef.current.cancel();
        };
    }, []);

    const startConversation = () => {
        shouldContinueRef.current = true;
        setError(null);
        setResponse('');
        setTranscript('');
        startListeningInternal();
    };

    const stopConversation = () => {
        shouldContinueRef.current = false;
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        synthRef.current.cancel();
        setStatus('idle');
    };

    const interruptSpeaking = () => {
        synthRef.current.cancel();
        if (shouldContinueRef.current) {
            setTranscript('');
            setResponse('');
            startListeningInternal();
        } else {
            setStatus('idle');
        }
    };

    const goBack = () => {
        shouldContinueRef.current = false;
        try { recognitionRef.current?.stop(); } catch (e) { }
        synthRef.current.cancel();
        navigate('/chat');
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'listening':
                return (
                    <div className="relative">
                        <div className="w-44 h-44 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/40">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-xl flex items-center justify-center border border-amber-300/30">
                                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-amber-400/80 to-orange-500/80 backdrop-blur-sm flex items-center justify-center animate-pulse border border-amber-200/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="drop-shadow-lg">
                                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                        <line x1="12" x2="12" y1="19" y2="22"></line>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-ping opacity-20"></div>
                        <div className="absolute -inset-4 rounded-full bg-amber-500/10 animate-pulse"></div>
                    </div>
                );
            case 'processing':
                return (
                    <div className="w-44 h-44 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/40">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-500/90 to-yellow-600/90 backdrop-blur-xl flex items-center justify-center border border-amber-300/30">
                            <div className="flex gap-3">
                                <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-4 h-4 bg-white rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                );
            case 'speaking':
                return (
                    <div
                        className="w-44 h-44 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 p-1 shadow-2xl shadow-emerald-500/40 cursor-pointer hover:scale-105 transition-transform"
                        onClick={interruptSpeaking}
                    >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-500/90 to-green-600/90 backdrop-blur-xl flex items-center justify-center border border-emerald-300/30">
                            <div className="flex items-end gap-1.5 h-16">
                                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2.5 bg-white rounded-full animate-soundwave shadow-md"
                                        style={{ animationDelay: `${i * 0.1}s` }}
                                    ></div>
                                ))}
                            </div>
                        </div>
                        <style>{`
              @keyframes soundwave {
                0%, 100% { height: 12px; }
                25% { height: 40px; }
                50% { height: 24px; }
                75% { height: 48px; }
              }
              .animate-soundwave {
                animation: soundwave 0.8s ease-in-out infinite;
              }
            `}</style>
                    </div>
                );
            default:
                return (
                    <div
                        className="w-44 h-44 rounded-full bg-gradient-to-br from-slate-600/50 to-slate-700/50 p-1 cursor-pointer hover:from-amber-400 hover:via-orange-500 hover:to-amber-600 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 group"
                        onClick={startConversation}
                    >
                        <div className="w-full h-full rounded-full bg-slate-800/80 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:bg-gradient-to-br group-hover:from-amber-500/90 group-hover:to-orange-600/90 group-hover:border-amber-300/30 transition-all duration-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50 group-hover:text-white transition-colors drop-shadow-lg">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                <line x1="12" x2="12" y1="19" y2="22"></line>
                            </svg>
                        </div>
                    </div>
                );
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'listening':
                return 'Listening...';
            case 'processing':
                return 'Thinking...';
            case 'speaking':
                return 'Speaking... (tap to interrupt)';
            default:
                return 'Tap to start conversation';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 p-4 flex items-center justify-between">
                <button
                    onClick={goBack}
                    className="flex items-center gap-2 px-4 py-2.5 text-amber-200/70 hover:text-amber-100 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl transition-all border border-white/10 hover:border-amber-500/30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5"></path>
                        <path d="M12 19l-7-7 7-7"></path>
                    </svg>
                    Back to Chat
                </button>

                <h1 className="text-xl font-semibold bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
                    Voice Mode
                </h1>

                {turnCount > 0 && (
                    <div className="px-3 py-1.5 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10 text-amber-200/60 text-sm">
                        {turnCount} turn{turnCount > 1 ? 's' : ''}
                    </div>
                )}
                {turnCount === 0 && <div className="w-20"></div>}
            </div>

            {/* Main content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
                {/* Status indicator */}
                <div className="mb-10">
                    {getStatusIcon()}
                </div>

                <p className="text-amber-100/70 text-lg font-medium mb-8 h-8">{getStatusText()}</p>

                {/* Transcript glass card */}
                {status === 'listening' && transcript && (
                    <div className="max-w-md w-full mb-4 p-5 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl">
                        <p className="text-amber-100 text-center leading-relaxed">{transcript}</p>
                    </div>
                )}

                {/* Response glass card */}
                {status === 'speaking' && response && (
                    <div className="max-w-md w-full mb-4 p-5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-2xl rounded-2xl border border-amber-500/20 shadow-xl shadow-amber-500/5">
                        <p className="text-amber-50 text-center leading-relaxed">{response}</p>
                    </div>
                )}

                {/* Error glass card */}
                {error && (
                    <div className="max-w-md w-full mb-4 p-4 bg-red-500/10 backdrop-blur-2xl rounded-xl border border-red-500/20">
                        <p className="text-red-300 text-center text-sm">{error}</p>
                    </div>
                )}

                {/* Stop button */}
                {status !== 'idle' && (
                    <button
                        onClick={stopConversation}
                        className="mt-10 px-8 py-3.5 bg-white/5 hover:bg-red-500/20 backdrop-blur-xl text-white/70 hover:text-red-300 rounded-xl transition-all border border-white/10 hover:border-red-500/30 font-medium"
                    >
                        End Conversation
                    </button>
                )}
            </div>

            {/* Footer instructions */}
            <div className="relative z-10 p-6 text-center">
                <div className="inline-block px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                    <p className="text-amber-200/50 text-sm">
                        Speak naturally in Hindi, English, or Kumaoni
                    </p>
                    <p className="text-amber-200/30 text-xs mt-1">
                        Conversation continues automatically • Chat history saved in main chat
                    </p>
                </div>
            </div>
        </div>
    );
}

export default VoiceChatPage;
