import type { OllamaRequest, OllamaResponse } from "../types/llama";

export const OLLAMA_BASE_URL = process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434";

export const DEFAULT_MODEL = "gemma3:4b";

export const createOllamaRequest = (
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  model: string = DEFAULT_MODEL,
  stream: boolean = false,
): OllamaRequest => ({
  model,
  messages,
  stream,
  options: {
    temperature: 0.7,
    top_p: 0.9,
    num_predict: 1000,
  },
});

export const callOllamaAPI = async (request: OllamaRequest): Promise<OllamaResponse> => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const streamOllamaAPI = async (request: OllamaRequest, onChunk: (chunk: string) => void): Promise<void> => {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim() === "") continue;
      try {
        const data = JSON.parse(line);
        if (data.message?.content) {
          onChunk(data.message.content);
        }
      } catch {
        console.warn("Failed to parse Ollama response:", line);
      }
    }
  }
};
