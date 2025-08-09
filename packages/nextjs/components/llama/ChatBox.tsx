import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useChat, useOllama } from "../../hooks/llama";
import type { OllamaMessage } from "../../types/llama";
import { AI_PERSONALITIES } from "../../utils/aiPersonalities";
import { useContractSummary } from "../../utils/contractSummary";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

export const ChatBox = () => {
  const { messages, isLoading, addMessage, addAIMessage, updateLastMessage, setLoading, setError, endChat, currentSessionId } = useChat();
  const { sendMessageWithPersonality, testConnection } = useOllama();
  const { address } = useAccount();
  const { userContractAddress } = useContractSummary();
  const [showEndChatButton, setShowEndChatButton] = useState(false);
  const [contractStoreEnabled, setContractStoreEnabled] = useState(true);

  useEffect(() => {
    // Test connection on mount
    testConnection().then((isConnected: boolean) => {
      if (!isConnected) {
        setError("Ollama is not running. Please start Ollama with: ollama serve");
      }
    });
  }, [testConnection, setError]);

  // Show end chat button when there are messages
  useEffect(() => {
    setShowEndChatButton(messages.length > 0);
  }, [messages.length]);

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

  const handleEndChat = async () => {
    try {
      await endChat(sendMessageWithPersonality, async (summary) => {
        console.log("Chat summary generated:", summary);
        
        // Try to store in contract if enabled and user has contract
        if (contractStoreEnabled && currentSessionId && userContractAddress && address) {
          try {
            // Note: This is a simplified approach. In practice, you'd want to handle this properly
            console.log("Would store in contract:", {
              sessionId: currentSessionId,
              userContract: userContractAddress,
              summaryPreview: summary.summary.substring(0, 100)
            });
            // For now, just log the attempt
            console.log("Contract storage would be attempted here");
          } catch (contractError) {
            console.error("Failed to store in contract:", contractError);
            setError("Failed to store summary in contract, but saved locally");
          }
        }
      });
    } catch (error) {
      console.error("Failed to end chat:", error);
      setError("Failed to end chat");
    }
  };

  return (
    <div className="bg-base-100 rounded-lg p-4 h-full flex flex-col">
      {/* Session and Contract Status */}
      <div className="mb-2 text-xs text-base-content/60">
        <div className="flex justify-between items-center">
          <span>
            Session: {currentSessionId ? `${currentSessionId.substring(0, 8)}...` : "Not started"}
          </span>
          <div className="flex items-center gap-2">
            <span>Contract: {userContractAddress ? "✓ Connected" : "⚠ Not found"}</span>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={contractStoreEnabled}
                onChange={(e) => setContractStoreEnabled(e.target.checked)}
                className="checkbox checkbox-xs"
              />
              <span>Store in contract</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex-1 mb-4 overflow-y-auto min-h-0">
        <MessageList messages={messages} />
      </div>
      <div className="flex-1">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          showEndChatButton={showEndChatButton}
          onEndChat={handleEndChat}
        />
      </div>
    </div>
  );
};
