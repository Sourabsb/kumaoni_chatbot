import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Sidebar({ currentSessionId, onSelectSession, onNewChat, onDeleteSession, isCollapsed, onToggle }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [hoveredSession, setHoveredSession] = useState(null);
    const { user, signout, refreshUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        loadSessions();
    }, [currentSessionId]);

    const loadSessions = async () => {
        try {
            const data = await sessionsApi.list();
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation();
        try {
            await sessionsApi.delete(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (sessionId === currentSessionId) {
                onDeleteSession();
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const groupedSessions = sessions.reduce((acc, session) => {
        const dateKey = formatDate(session.updated_at);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(session);
        return acc;
    }, {});

    const handleSignOut = async () => {
        await signout();
        navigate('/');
    };

    if (isCollapsed) {
        return (
            <aside className="w-16 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-4">
                <button
                    onClick={onToggle}
                    className="p-3 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-xl transition-all mb-4"
                    title="Expand sidebar"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </button>

                <button
                    onClick={onNewChat}
                    className="p-3 text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/20 rounded-xl transition-all border border-transparent hover:border-amber-500/30"
                    title="New Chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                </button>

                <div className="flex-1" />

                <button
                    onClick={() => { onToggle(); setTimeout(() => setShowSettings(true), 100); }}
                    className="p-3 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-xl transition-all"
                    title="Settings"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-semibold text-slate-900">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                </button>
            </aside>
        );
    }

    return (
        <>
            <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col">
                <div className="p-3 flex items-center gap-2 border-b border-white/10">
                    <button
                        onClick={onToggle}
                        className="p-2.5 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-lg transition-all"
                        title="Collapse sidebar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={onNewChat}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 rounded-lg text-amber-100 font-medium transition-all text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {loading ? (
                        <div className="text-center text-amber-200/40 py-8 text-sm">Loading...</div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center text-amber-200/40 py-8 text-sm">No conversations yet</div>
                    ) : (
                        Object.entries(groupedSessions).map(([date, dateSessions]) => (
                            <div key={date}>
                                <h3 className="text-xs font-medium text-amber-200/40 uppercase tracking-wider mb-2 px-2">{date}</h3>
                                <div className="space-y-1">
                                    {dateSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="relative group"
                                            onMouseEnter={() => setHoveredSession(session.id)}
                                            onMouseLeave={() => setHoveredSession(null)}
                                        >
                                            <button
                                                onClick={() => onSelectSession(session.id)}
                                                className={`w-full text-left px-3 py-2 pr-10 rounded-lg text-sm transition-all truncate ${session.id === currentSessionId
                                                    ? 'bg-amber-500/20 text-amber-100 border border-amber-500/30'
                                                    : 'text-amber-200/60 hover:bg-white/5 hover:text-amber-100'
                                                    }`}
                                            >
                                                {session.title || 'New Chat'}
                                            </button>
                                            {hoveredSession === session.id && (
                                                <button
                                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-amber-200/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                                                    title="Delete chat"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-amber-200/60 hover:text-amber-100 hover:bg-white/5 rounded-lg transition-all text-sm"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-semibold text-slate-900 shadow-lg shadow-amber-500/30">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 text-left truncate">
                            <div className="font-medium text-amber-100">{user?.name || 'User'}</div>
                            <div className="text-xs text-amber-200/40 truncate">{user?.email}</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                        </svg>
                    </button>
                </div>
            </aside>

            {showSettings && (
                <SettingsModal
                    user={user}
                    onClose={() => setShowSettings(false)}
                    onSignOut={handleSignOut}
                    onUpdateUser={refreshUser}
                />
            )}
        </>
    );
}

function SettingsModal({ user, onClose, onSignOut, onUpdateUser }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();

    const handleSave = async () => {
        if (password && password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            await authApi.update(name || null, password || null);
            setMessage('Saved successfully!');
            if (onUpdateUser) onUpdateUser();
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await authApi.delete();
            navigate('/');
        } catch (error) {
            setMessage('Failed to delete account');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">Settings</h2>
                    <button onClick={onClose} className="p-2 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-lg transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === 'profile' ? 'text-amber-100 border-b-2 border-amber-400' : 'text-amber-200/50 hover:text-amber-100'}`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-3 text-sm font-medium transition-all ${activeTab === 'security' ? 'text-amber-100 border-b-2 border-amber-400' : 'text-amber-200/50 hover:text-amber-100'}`}
                    >
                        Security
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {activeTab === 'profile' && (
                        <>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-semibold text-slate-900 shadow-lg shadow-amber-500/30">
                                    {name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="text-sm text-amber-200/50">Account ID</div>
                                    <div className="text-amber-100 font-mono">#{user?.id}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-200/70 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-200/70 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={user?.email}
                                    disabled
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                                />
                                <p className="text-xs text-amber-200/30 mt-1">Email cannot be changed</p>
                            </div>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-amber-200/70 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Leave blank to keep current"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-200/70 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                                />
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all border border-red-500/20"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </>
                    )}

                    {message && (
                        <div className={`p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message}
                        </div>
                    )}
                </div>

                <div className="p-5 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onSignOut}
                        className="px-4 py-2.5 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-xl transition-all text-sm"
                    >
                        Sign Out
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-xl transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-medium rounded-xl hover:from-amber-300 hover:to-orange-400 transition-all text-sm disabled:opacity-50 shadow-lg shadow-amber-500/30"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-slate-900 rounded-2xl w-full max-w-sm border border-white/10 shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-white mb-2">Delete Account?</h3>
                        <p className="text-amber-200/60 text-sm mb-6">This will permanently delete your account and all chat history. This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2.5 text-amber-200/60 hover:text-amber-100 hover:bg-white/10 rounded-xl transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Sidebar;
