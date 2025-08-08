import { useCallback, useState } from "react";
import type { ChatMessage, ChatState } from "../../types/llama";

// Helper function to generate unique IDs
const generateUniqueId = (role: "user" | "assistant"): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const rolePrefix = role === "user" ? "u" : "a";
  return `${rolePrefix}-${timestamp}-${random}`;
};

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const addMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateUniqueId(message.role),
      timestamp: new Date(),
    };

    setState((prev: ChatState) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  const addAIMessage = useCallback((content: string, personality: "helper" | "thinker" | "curious") => {
    const newMessage: ChatMessage = {
      id: generateUniqueId("assistant"),
      role: "assistant",
      content,
      timestamp: new Date(),
      aiPersonality: personality,
    };

    setState((prev: ChatState) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setState((prev: ChatState) => ({
      ...prev,
      messages: prev.messages.map((msg: ChatMessage, index: number) =>
        index === prev.messages.length - 1 ? { ...msg, content: content } : msg,
      ),
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev: ChatState) => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev: ChatState) => ({ ...prev, error }));
  }, []);

  const clearMessages = useCallback(() => {
    setState((prev: ChatState) => ({ ...prev, messages: [] }));
  }, []);

  const endChat = useCallback(
    async (
      sendMessageWithPersonality: (
        messages: any[],
        personality: "helper" | "thinker" | "curious",
        model?: string,
        onStream?: (chunk: string) => void,
      ) => Promise<string | void>,
      onSummaryGenerated?: (summary: any) => void,
    ) => {
      try {
        setLoading(true);
        setError(null);

        // Generate goodbye message
        const goodbyePrompt =
          "The user wants to end this conversation. Please provide a friendly goodbye message that acknowledges the conversation and thanks them for chatting. Keep it brief and warm.";

        const goodbyeMessage = await sendMessageWithPersonality(
          [{ role: "user", content: goodbyePrompt }],
          "helper",
          "gemma3:4b",
        );

        // Add goodbye message to chat
        addAIMessage(goodbyeMessage as string, "helper");

        // Generate and save summary
        const { generateChatSummary, createChatSummary, saveChatSummary } = await import("../../utils/chatSummary");

        const summary = await generateChatSummary(state.messages, sendMessageWithPersonality);
        const chatSummary = createChatSummary(state.messages, summary);

        await saveChatSummary(chatSummary);

        // Call the callback if provided
        if (onSummaryGenerated) {
          onSummaryGenerated(chatSummary);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to end chat");
      } finally {
        setLoading(false);
      }
    },
    [state.messages, addAIMessage, setLoading, setError],
  );

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    addMessage,
    addAIMessage,
    updateLastMessage,
    setLoading,
    setError,
    clearMessages,
    endChat,
  };
};
