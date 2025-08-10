import type { ChatMessage } from "../types/llama";

export interface ChatSummary {
  id: string;
  timestamp: string;
  summary: string;
  metadata: {
    conversation_length: number;
    topic?: string;
    key_points?: string[];
    duration?: string;
  };
  sessionId?: string; // Add session ID for contract integration
  contractStored?: boolean; // Track if stored in contract
}

export const generateChatSummary = async (
  messages: ChatMessage[],
  sendMessageWithPersonality: (
    messages: any[],
    personality: "helper" | "thinker" | "curious",
    model?: string,
    onStream?: (chunk: string) => void,
  ) => Promise<string | void>,
): Promise<string> => {
  // Create a summary prompt
  const summaryPrompt = `Please provide a concise summary of this conversation. Focus on the main topics discussed, key points, and any important conclusions or decisions made. Keep the summary under 200 words.`;

  // Prepare messages for summarization
  const conversationText = messages
    .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
    .join("\n\n");

  const fullPrompt = `${summaryPrompt}\n\nConversation:\n${conversationText}`;

  // Send to Ollama for summarization
  const summary = await sendMessageWithPersonality([{ role: "user", content: fullPrompt }], "helper", "gemma3:4b");

  return summary as string;
};

export const saveChatSummary = async (
  summary: ChatSummary,
  sessionId?: string,
  _saveToContract: boolean = true
): Promise<void> => {
  try {
    // Save to localStorage for persistence only (no filesystem or downloads)
    const summaries = JSON.parse(localStorage.getItem("chat-summaries") || "[]");
    const updatedSummary = { ...summary, sessionId, contractStored: false };
    summaries.push(updatedSummary);
    localStorage.setItem("chat-summaries", JSON.stringify(summaries));

    console.log("Chat summary saved to localStorage");
  } catch (error) {
    console.error("Error saving chat summary:", error);
    throw error;
  }
};

export const createChatSummary = (messages: ChatMessage[], summary: string): ChatSummary => {
  const now = new Date();
  const id = `summary_${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}_${String(now.getMinutes()).padStart(2, "0")}`;

  // Calculate conversation duration
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  const durationMs = lastMessage.timestamp.getTime() - firstMessage.timestamp.getTime();
  const durationMinutes = Math.round(durationMs / 60000);

  return {
    id,
    timestamp: now.toISOString(),
    summary,
    metadata: {
      conversation_length: messages.length,
      duration: `${durationMinutes} minutes`,
    },
  };
};
