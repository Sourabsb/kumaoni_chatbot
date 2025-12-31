import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

function ChatWindow({ messages, isLoading, messagesEndRef }) {
  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6 min-h-full pb-32">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-5xl shadow-2xl shadow-amber-500/30 border border-amber-300/30">
            🏔️
          </div>
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-amber-200 to-orange-300 bg-clip-text text-transparent">
            How can I help you today?
          </h2>
          <p className="text-amber-200/40 max-w-md">
            Start a conversation in Hindi, English, or Kumaoni. I'll respond in authentic Kumaoni!
          </p>
        </div>
      )}

      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
}

export default ChatWindow;
