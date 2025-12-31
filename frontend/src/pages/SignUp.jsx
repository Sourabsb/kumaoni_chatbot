import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signup(email, password, name);
            navigate('/chat');
        } catch (err) {
            setError('Email already exists or invalid data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8 animate-fade-in">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-xl shadow-amber-500/30 border border-amber-300/30 group-hover:scale-105 transition-transform">
                            🏔️
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">Create account</h1>
                    <p className="text-amber-100/50 mt-2">Start your Kumaoni conversation journey</p>
                </div>

                {/* Glass card form */}
                <div className="p-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-amber-200/70 mb-2">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-amber-200/70 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-amber-200/70 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold rounded-xl hover:from-amber-300 hover:to-orange-400 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p className="text-center text-amber-200/50">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-amber-300 hover:text-amber-200 hover:underline transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
