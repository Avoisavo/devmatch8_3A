"use client";

import { useMemo } from "react";
import { useScaffoldReadContract } from "./scaffold-eth/useScaffoldReadContract";

export const useSummaryContent = (summaryId?: string) => {
  const args = useMemo(() => (summaryId ? [summaryId] : undefined), [summaryId]);

  const { data, isLoading, error, refetch } = useScaffoldReadContract({
    contractName: "SummaryVault",
    functionName: "getSummary",
    args: args as any,
    watch: true,
    // query options are handled inside the hook
  });

  return {
    content: (data as string | undefined) ?? "",
    loading: isLoading,
    error: error ? (error as any).message || "Error" : null,
    refetch,
  };
};
