import { KeyboardEvent, useState } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  showEndChatButton?: boolean;
  onEndChat?: () => void;
}

export const MessageInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message here...",
  showEndChatButton = false,
  onEndChat,
}: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-3 bg-base-200 rounded border border-base-300 resize-none"
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
        />
      </div>
      <div className="flex justify-between items-center">
        {showEndChatButton && onEndChat && (
          <button onClick={onEndChat} disabled={isLoading} className="btn btn-secondary px-4 py-2 min-w-fit">
            {isLoading ? "Ending..." : "End Chat"}
          </button>
        )}
        <button onClick={handleSend} disabled={!message.trim() || isLoading} className="btn btn-primary">
          {isLoading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};
