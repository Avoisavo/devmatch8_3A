import { useEffect, useState } from "react";
import type { ChatSummary as StoredSummary } from "../utils/chatSummary";

export interface ChatSummary {
  id: string;
  date: string;
  summary: string;
  messageCount: number;
  participants: string[];
  tags: string[];
  createdAt: string;
  title?: string;
}

export const useChatSummariesLocalOnly = () => {
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSummaries = JSON.parse(localStorage.getItem("chat-summaries") || "[]");

      // Convert stored summaries to the expected format
      const convertedSummaries: ChatSummary[] = storedSummaries.map((summary: StoredSummary) => ({
        id: summary.id,
        date: summary.timestamp.split("T")[0], // Extract date from timestamp
        summary: summary.summary,
        messageCount: summary.metadata.conversation_length,
        participants: ["User", "Assistant"], // Default participants
        tags: [], // No tags in stored summaries
        createdAt: summary.timestamp,
        title: `Chat Summary ${summary.id}`,
      }));

      setSummaries(convertedSummaries);
    } catch (err) {
      setError("Failed to load summaries");
      console.error("Error loading summaries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSummary = async (id: string) => {
    try {
      const updatedSummaries = summaries.filter(s => s.id !== id);
      setSummaries(updatedSummaries);

      // Update localStorage
      const storedSummaries = JSON.parse(localStorage.getItem("chat-summaries") || "[]");
      const updatedStoredSummaries = storedSummaries.filter((s: StoredSummary) => s.id !== id);
      localStorage.setItem("chat-summaries", JSON.stringify(updatedStoredSummaries));
    } catch (err) {
      console.error("Error deleting summary:", err);
    }
  };

  const updateSummary = (id: string, updates: Partial<ChatSummary>) => {
    setSummaries(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  // Downloads are disabled per request
  const exportSummary = (_summary: ChatSummary) => {
    console.warn("Export disabled");
  };

  const exportAllSummaries = () => {
    console.warn("Export all disabled");
  };

  const clearAllSummaries = () => {
    setSummaries([]);
    localStorage.removeItem("chat-summaries");
  };

  return {
    summaries,
    loading,
    error,
    deleteSummary,
    updateSummary,
    exportSummary,
    exportAllSummaries,
    clearAllSummaries,
  };
};
