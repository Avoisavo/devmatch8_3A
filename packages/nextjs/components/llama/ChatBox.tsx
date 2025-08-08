import { useEffect } from "react";
import { useChat, useOllama } from "../../hooks/llama";
import type { OllamaMessage } from "../../types/llama";
import { AI_PERSONALITIES } from "../../utils/aiPersonalities";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export const ChatBox = () => {
  const { messages, isLoading, addMessage, addAIMessage, updateLastMessage, setLoading, setError } = useChat();
  const { sendMessageWithPersonality, testConnection } = useOllama();

  useEffect(() => {
    // Test connection on mount (only on client side)
    if (typeof window !== "undefined") {
      testConnection().then((isConnected: boolean) => {
        if (!isConnected) {
          setError("Ollama is not running. Please start Ollama with: ollama serve");
        }
      });
    }
  }, [testConnection, setError]);

  const handleSendMessage = async (content: string) => {
    try {
      setError(null);
      setLoading(true);

      // Add user message
      addMessage({ role: "user", content });

      // Prepare messages for Ollama
      const ollamaMessages: OllamaMessage[] = messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));
      ollamaMessages.push({ role: "user", content });

      // Sequential AI responses with different personalities
      for (const personality of AI_PERSONALITIES) {
        // Wait for the specified delay
        if (personality.delay > 0) {
          await new Promise(resolve => setTimeout(resolve, personality.delay));
        }

        // Add placeholder message for this AI personality
        addAIMessage("", personality.id);

        // Stream the response for this personality
        let fullResponse = "";
        await sendMessageWithPersonality(ollamaMessages, personality.id, "gemma3:4b", (chunk: string) => {
          fullResponse += chunk;
          updateLastMessage(fullResponse);
        });

        // Update the final response
        updateLastMessage(fullResponse);

        // Add a small delay between AI responses
        if (personality.id !== "curious") {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 rounded-lg p-4 h-full flex flex-col">
      <div className="flex-1 mb-4 overflow-y-auto min-h-0">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
