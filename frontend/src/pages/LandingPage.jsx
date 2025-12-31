import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl"></div>
            </div>

            <header className="relative z-10 flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/30 border border-amber-300/30">
                        🏔️
                    </div>
                    <h1 className="text-lg font-semibold bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent tracking-tight">
                        Kumaoni Chatbot
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/signin"
                        className="px-4 py-2 text-sm font-medium text-amber-200/70 hover:text-amber-100 transition-colors"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 text-sm font-medium text-slate-900 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-xl transition-all shadow-lg shadow-amber-500/30"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="max-w-2xl space-y-8 animate-fade-in">
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-6xl shadow-2xl shadow-amber-500/40 border border-amber-300/30 backdrop-blur-xl">
                        🏔️
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                        Speak in <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">Kumaoni</span>
                    </h2>

                    <p className="text-xl text-amber-100/50 max-w-lg mx-auto leading-relaxed">
                        Experience conversations in authentic Kumaoni language powered by AI.
                        Preserve and learn the beautiful language of Uttarakhand.
                    </p>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <Link
                            to="/signup"
                            className="px-10 py-4 text-lg font-semibold text-slate-900 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 rounded-2xl transition-all shadow-xl shadow-amber-500/30 hover:shadow-2xl hover:shadow-amber-500/40 hover:scale-105"
                        >
                            Start Chatting →
                        </Link>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
                        {['AI Powered', 'Real-time Voice', 'Authentic Kumaoni', 'Free to Use'].map((feature, i) => (
                            <div
                                key={i}
                                className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-amber-200/60 text-sm"
                            >
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="relative z-10 py-6 text-center text-amber-200/30 text-sm">
                Built with ❤️ for Kumaoni language preservation
            </footer>
        </div>
    );
}

export default LandingPage;
