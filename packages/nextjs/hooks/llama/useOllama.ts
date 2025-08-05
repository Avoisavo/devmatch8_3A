import { useCallback } from "react";
import type { OllamaMessage } from "../../types/llama";
import { callOllamaAPI, createOllamaRequest, streamOllamaAPI } from "../../utils/llama";

export const useOllama = () => {
  const sendMessage = useCallback(
    async (messages: OllamaMessage[], model: string = "gemma3:4b", onStream?: (chunk: string) => void) => {
      try {
        const request = createOllamaRequest(messages, model, !!onStream);

        if (onStream) {
          await streamOllamaAPI(request, onStream);
        } else {
          const response = await callOllamaAPI(request);
          return response.message.content;
        }
      } catch (error) {
        console.error("Ollama API error:", error);
        throw error;
      }
    },
    [],
  );

  const testConnection = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:11434/api/tags");
      return response.ok;
    } catch (error) {
      console.error("Ollama connection test failed:", error);
      return false;
    }
  }, []);

  return {
    sendMessage,
    testConnection,
  };
};
