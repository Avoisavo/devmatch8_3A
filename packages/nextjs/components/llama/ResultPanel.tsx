import type { ChatMessage } from "../../types/llama";

interface ResultPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onClear: () => void;
}

export const ResultPanel = ({ messages, isLoading, error, onClear }: ResultPanelProps) => {
  const assistantMessages = messages.filter(msg => msg.role === "assistant");

  return (
    <div className="w-80 bg-base-100 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Results</h3>
        <button onClick={onClear} className="btn btn-sm btn-ghost">
          Clear
        </button>
      </div>

      <div className="bg-base-200 rounded p-3 min-h-[250px] max-h-[400px] overflow-y-auto">
        {error && (
          <div className="text-error text-sm mb-2">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-base-content/70">
            <div className="loading loading-spinner loading-sm"></div>
            <span>AI is thinking...</span>
          </div>
        )}

        {assistantMessages.length === 0 && !isLoading && !error && (
          <p className="text-base-content/60">AI responses will appear here</p>
        )}

        {assistantMessages.map(message => (
          <div key={message.id} className="mb-3 p-2 bg-base-100 rounded">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-base-content/50">{message.timestamp.toLocaleTimeString()}</p>
              <p className="text-xs text-base-content/30 font-mono">{message.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
