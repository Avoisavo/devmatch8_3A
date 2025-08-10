import { useEffect, useState } from "react";
import { useChat, useOllama } from "../../hooks/llama";
import type { OllamaMessage } from "../../types/llama";
import { AI_PERSONALITIES } from "../../utils/aiPersonalities";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract, useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useSummaryCrypto } from "../../hooks/useSummaryCrypto";
import { stringToBytes } from "../../utils/contractSummary";
import { notification, getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

interface ChatBoxProps {
  onTalkingChange?: (talking: boolean) => void;
}

export const ChatBox = ({ onTalkingChange }: ChatBoxProps) => {
  const {
    messages,
    isLoading,
    addMessage,
    addAIMessage,
    updateLastMessage,
    setLoading,
    setError,
    endChat,
    currentSessionId,
  } = useChat();
  const { sendMessageWithPersonality, testConnection } = useOllama();
  const { address } = useAccount();
  const { encrypt } = useSummaryCrypto();
  const selectedNetwork = useSelectedNetwork();
  const { writeContractAsync: writeFactoryAsync } = useScaffoldWriteContract({
    contractName: "SubscriptionAndSummaryFactory",
  });
  const [showEndChatButton, setShowEndChatButton] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

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

  // Show end chat button when there are messages
  useEffect(() => {
    setShowEndChatButton(messages.length > 0);
  }, [messages.length]);

  const handleSendMessage = async (content: string) => {
    try {
      setError(null);
      setLoading(true);
      onTalkingChange?.(true);

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
        await sendMessageWithPersonality(ollamaMessages, personality.id, undefined, (chunk: string) => {
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
      onTalkingChange?.(false);
    }
  };

  const handleEndChat = async () => {
    try {
      onTalkingChange?.(false);
      await endChat(sendMessageWithPersonality, async summary => {
        console.log("Chat summary generated:", summary);

        // Try to store in contract via factory.addMySummary
        try {
          if (!address) {
            // No wallet connected, skip on-chain store silently
            return;
          }
          const signToastId = notification.loading("Please sign the message in your wallet to encrypt the summary...");
          const encrypted = await encrypt(summary.summary);
          notification.remove(signToastId);

          const asBytes = stringToBytes(encrypted);

          // Call SubscriptionAndSummaryFactory.addMySummary(bytes)
          const hash = (await writeFactoryAsync({
            functionName: "addMySummary",
            args: [asBytes],
          })) as string;

          setLastTxHash(hash);
        } catch (_e) {
          // Suppress UI error per request
        }
      });
    } catch (error) {
      console.error("Failed to end chat:", error);
      setError("Failed to end chat");
    }
  };

  return (
    <div className="bg-base-100 rounded-lg p-4 h-full flex flex-col">
      <div className="flex-1 mb-2 overflow-y-auto min-h-0">
        <MessageList messages={messages} />
      </div>

      {/* Transaction banner */}
      {lastTxHash && (
        <div className="mb-2 text-xs p-2 rounded bg-base-200 text-base-content/80 flex items-center justify-between">
          <span>
            Last tx: {lastTxHash.slice(0, 10)}…
          </span>
          <a
            href={getBlockExplorerTxLink(selectedNetwork.id, lastTxHash)}
            target="_blank"
            rel="noreferrer"
            className="link"
          >
            view in explorer
          </a>
        </div>
      )}

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
