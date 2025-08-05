import type { ChatMessage } from "../../types/llama";

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-base-content/60">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      {messages.map(message => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[80%] p-3 rounded-lg ${
              message.role === "user" ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs opacity-70">{message.timestamp.toLocaleTimeString()}</p>
              <p className="text-xs opacity-50 font-mono">ID: {message.id}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
