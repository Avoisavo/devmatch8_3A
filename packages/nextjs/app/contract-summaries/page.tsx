"use client";

import { useCallback, useEffect, useState } from "react";
import { useContractSummary } from "../../utils/contractSummary";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

interface ContractSummary {
  sessionId: string;
  encryptedSummary: string;
  createdAt: number;
  messageCount: number;
  decryptedSummary?: string;
}

export default function ContractSummariesPage() {
  const { isConnected } = useAccount();
  const [summaries, setSummaries] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userContractAddress } = useContractSummary();

  // Get summaries count from the user summary contract
  const { data: summariesCount, refetch: refetchSessions } = useScaffoldReadContract({
    contractName: "UserSummaryStorage",
    functionName: "summariesCount",
  });

  // Load summaries from contract
  const loadContractSummaries = useCallback(async () => {
    if (!summariesCount || summariesCount === 0n || !userContractAddress) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const summariesData: ContractSummary[] = [];

      // For each summary index, try to get its data
      for (let i = 0; i < Number(summariesCount); i++) {
        try {
          // This would require implementing a read function in the contract
          // For now, we'll show placeholder data
          summariesData.push({
            sessionId: `session_${i}`,
            encryptedSummary: "encrypted_data_placeholder",
            createdAt: Date.now(),
            messageCount: 0,
            decryptedSummary: "This would be a decrypted summary from the contract",
          });
        } catch (err) {
          console.error(`Failed to load summary for index ${i}:`, err);
        }
      }

      setSummaries(summariesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load summaries");
    } finally {
      setLoading(false);
    }
  }, [summariesCount, userContractAddress]);

  useEffect(() => {
    if (userContractAddress && summariesCount) {
      loadContractSummaries();
    }
  }, [userContractAddress, summariesCount, loadContractSummaries]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-warning">
          <span>Please connect your wallet to view contract summaries</span>
        </div>
      </div>
    );
  }

  if (!userContractAddress || userContractAddress === "0x0000000000000000000000000000000000000000") {
    return (
      <div className="container mx-auto p-6">
        <div className="alert alert-info">
          <span>Please subscribe first to create your user contract and start storing summaries</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contract Stored Summaries</h1>
        <button onClick={() => refetchSessions()} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>

      {/* Contract Info */}
      <div className="bg-base-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Your Contract Information</h2>
        <div className="space-y-1 text-sm">
          <div>
            <span className="font-medium">User Contract:</span>
            <span className="ml-2 font-mono text-xs break-all">{userContractAddress}</span>
          </div>
          <div>
            <span className="font-medium">Total Summaries:</span>
            <span className="ml-2">{summariesCount ? Number(summariesCount) : 0}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">Loading contract summaries...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>Error: {error}</span>
        </div>
      )}

      {/* No Summaries */}
      {!loading && summaries.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-base-content/60 mb-2">No Contract Summaries Found</h3>
          <p className="text-base-content/50">
            Start a chat conversation and end it to create your first contract-stored summary.
          </p>
        </div>
      )}

      {/* Summaries List */}
      {summaries.length > 0 && (
        <div className="space-y-4">
          {summaries.map((summary, index) => (
            <div key={summary.sessionId} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="card-title text-lg">Session #{index + 1}</h3>
                  <div className="text-xs text-base-content/60">{new Date(summary.createdAt).toLocaleString()}</div>
                </div>

                <div className="text-sm text-base-content/70 mb-3">
                  <span className="font-mono bg-base-200 px-2 py-1 rounded">
                    {summary.sessionId.substring(0, 16)}...
                  </span>
                </div>

                <div className="bg-base-200 rounded p-3 mb-3">
                  <h4 className="font-medium mb-2">Summary:</h4>
                  <p className="text-sm whitespace-pre-wrap">
                    {summary.decryptedSummary || "Encrypted summary (decryption pending...)"}
                  </p>
                </div>

                <div className="flex justify-between text-xs text-base-content/60">
                  <span>Messages: {summary.messageCount}</span>
                  <span>Stored on blockchain ✓</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 text-center text-sm text-base-content/60">
        <p>
          These summaries are stored encrypted on the Oasis Sapphire blockchain. Only you can decrypt and view them with
          your connected wallet.
        </p>
      </div>
    </div>
  );
}
