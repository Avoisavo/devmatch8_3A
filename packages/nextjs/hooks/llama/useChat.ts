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
  };
};
