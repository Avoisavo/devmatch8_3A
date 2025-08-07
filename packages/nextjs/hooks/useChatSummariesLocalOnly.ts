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
  return {
    summaries: [] as ChatSummary[],
    loading: false,
    error: null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deleteSummary: async (id: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSummary: (id: string, updates: Partial<ChatSummary>) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    exportSummary: (summary: ChatSummary) => {},
    exportAllSummaries: () => {},
    clearAllSummaries: () => {},
  };
};
