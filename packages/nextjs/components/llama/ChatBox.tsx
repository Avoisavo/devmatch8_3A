import { useEffect } from "react";
import { useChat, useOllama } from "../../hooks/llama";
import type { OllamaMessage } from "../../types/llama";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export const ChatBox = () => {
  const { messages, isLoading, addMessage, updateLastMessage, setLoading, setError } = useChat();
  const { sendMessage, testConnection } = useOllama();

  useEffect(() => {
    // Test connection on mount
    testConnection().then((isConnected: boolean) => {
      if (!isConnected) {
        setError("Ollama is not running. Please start Ollama with: ollama serve");
      }
    });
  }, [testConnection, setError]);

  const handleSendMessage = async (content: string) => {
    try {
      setError(null);
      setLoading(true);

      // Add user message with unique ID
      addMessage({ role: "user", content });

      // Prepare messages for Ollama
      const ollamaMessages: OllamaMessage[] = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));
      ollamaMessages.push({ role: "user", content });

      // Add assistant message placeholder with unique ID
      addMessage({ role: "assistant", content: "" });

      // Stream the response
      let fullResponse = "";
      await sendMessage(ollamaMessages, "gemma3:4b", (chunk: string) => {
        fullResponse += chunk;
        updateLastMessage(fullResponse);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      // Remove the empty assistant message if there was an error
      if (
        messages.length > 0 &&
        messages[messages.length - 1].role === "assistant" &&
        messages[messages.length - 1].content === ""
      ) {
        // This would need a removeLastMessage function, but for now we'll just set an error
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 rounded-lg p-4 min-h-[300px] flex flex-col">
      <div className="flex-1 mb-4 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
