"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

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

const SUBGRAPH_URL =
  process.env.NEXT_PUBLIC_SUBGRAPH_URL || "http://localhost:8000/subgraphs/name/devmatch/summary-vault";

const QUERY = /* GraphQL */ `
  query SummariesByUser($user: Bytes!, $first: Int = 50, $skip: Int = 0) {
    summaries(where: { user: $user }, orderBy: timestamp, orderDirection: desc, first: $first, skip: $skip) {
      summaryId
      title
      timestamp
      user
    }
  }
`;

export const useSubgraphSummaries = () => {
  const { address } = useAccount();
  const [summaries, setSummaries] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canQuery = useMemo(() => Boolean(address && SUBGRAPH_URL), [address]);

  useEffect(() => {
    let cancelled = false;
    if (!canQuery) {
      setSummaries([]);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(SUBGRAPH_URL, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            query: QUERY,
            variables: { user: address!.toLowerCase(), first: 100, skip: 0 },
          }),
        });
        if (!res.ok) throw new Error(`Subgraph HTTP ${res.status}`);
        const json = await res.json();
        if (json.errors?.length) throw new Error(json.errors[0]?.message || "Subgraph error");
        const rows: Array<{ summaryId: string; title?: string | null; timestamp: string }> = json.data?.summaries || [];
        if (cancelled) return;

        const mapped: ChatSummary[] = rows.map(r => {
          const ts = Number(r.timestamp);
          const createdAt = new Date(ts * 1000).toISOString();
          return {
            id: r.summaryId,
            date: createdAt.split("T")[0],
            summary: "", // content is private on Sapphire; fetch via contract getSummary(id) as needed
            messageCount: 0,
            participants: ["User", "Assistant"],
            tags: [],
            createdAt,
            title: r.title || `Chat Summary ${r.summaryId}`,
          };
        });
        setSummaries(mapped);
      } catch (e: any) {
        console.error("Subgraph fetch error", e);
        setError(e?.message || "Failed to load from Subgraph");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [address, canQuery]);

  const deleteSummary = async (id: string) => {
    void id;
    // No-op: subgraphs are append-only; implement delete in your app layer if needed
  };

  const exportSummary = (summary: ChatSummary) => {
    const dataStr = JSON.stringify(summary, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${summary.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { summaries, loading, error, deleteSummary, exportSummary };
};
