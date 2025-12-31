import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import InputBox from '../components/InputBox';
import { sendMessage, resetSession, sessionsApi } from '../services/api';

function ChatPage() {
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const messagesEndRef = useRef(null);
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text) => {
        if (!text.trim() || isLoading) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setIsLoading(true);

        try {
            const response = await sendMessage(text, sessionId);

            if (!sessionId) {
                setSessionId(response.session_id);
            }

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.reply,
                englishMeaning: response.english_meaning,
                examples: response.retrieved_examples,
                messageId: response.message_id
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Error: Could not get response. Please try again.',
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = async () => {
        setMessages([]);
        setSessionId(null);
    };

    const handleDeleteSession = () => {
        setMessages([]);
        setSessionId(null);
    };

    const handleSelectSession = async (selectedSessionId) => {
        if (selectedSessionId === sessionId) return;

        try {
            const history = await sessionsApi.getHistory(selectedSessionId);
            setSessionId(selectedSessionId);
            setMessages(history.map(msg => ({
                role: msg.role,
                content: msg.content,
                englishMeaning: msg.english_meaning
            })));
        } catch (error) {
            console.error('Failed to load session:', error);
        }
    };

    const handleSignOut = async () => {
        await signout();
        navigate('/');
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
            </div>

            <Sidebar
                currentSessionId={sessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                onDeleteSession={handleDeleteSession}
                isCollapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Top right sign out button */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-200/60 hover:text-amber-100 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-xl transition-all border border-white/10 hover:border-amber-500/30"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pt-16">
                    <ChatWindow
                        messages={messages}
                        isLoading={isLoading}
                        messagesEndRef={messagesEndRef}
                    />
                </div>
                <InputBox onSend={handleSend} disabled={isLoading} />
            </div>
        </div>
    );
}

export default ChatPage;
