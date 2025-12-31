function TypingIndicator() {
  return (
    <div className="flex w-full justify-start animate-fade-in">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl px-5 py-4 border border-white/10">
        <div className="flex space-x-1.5 h-4 items-center">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
