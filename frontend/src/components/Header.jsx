function Header({ onNewChat, onMenuClick, userName, onSignOut }) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm shadow-lg">
            🏔️
          </div>
          <h1 className="text-base font-semibold text-white/90 tracking-tight hidden sm:block">
            Kumaoni Chatbot
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {userName && (
          <span className="text-sm text-white/50 hidden sm:block">
            Hi, {userName}
          </span>
        )}
        <button
          onClick={onNewChat}
          className="px-3 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors hidden md:block"
        >
          New Chat
        </button>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="px-3 py-2 text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
