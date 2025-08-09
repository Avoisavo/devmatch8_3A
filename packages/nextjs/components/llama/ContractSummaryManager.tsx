import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useContractSummary } from "../../utils/contractSummary";
import type { ChatSummary } from "../../utils/chatSummary";

interface ContractSummaryManagerProps {
  summary: ChatSummary;
  sessionId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const ContractSummaryManager = ({ 
  summary, 
  sessionId, 
  onSuccess, 
  onError 
}: ContractSummaryManagerProps) => {
  const { address } = useAccount();
  const [isStoring, setIsStoring] = useState(false);
  const [isStored, setIsStored] = useState(false);
  
  const { userContractAddress, encryptSummary, stringToBytes } = useContractSummary();
  
  // Write contract function
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "UserContract"
  });

  const handleStoreInContract = async () => {
    if (!userContractAddress || !address || !sessionId) {
      onError?.("Missing contract address, user address, or session ID");
      return;
    }

    setIsStoring(true);
    
    try {
      console.log("Storing summary in contract:", {
        userContract: userContractAddress,
        sessionId,
        summaryLength: summary.summary.length
      });

      // Encrypt and convert summary to bytes
      const encryptedSummary = encryptSummary(summary.summary);
      const summaryBytes = stringToBytes(encryptedSummary);
      const sessionIdBytes = `0x${sessionId.replace(/[^a-fA-F0-9]/g, '').padEnd(64, '0').substring(0, 64)}` as `0x${string}`;

      // Call the contract
      const tx = await writeContractAsync({
        functionName: "storeChatSummary",
        args: [sessionIdBytes, summaryBytes],
        address: userContractAddress,
      });

      console.log("Summary stored in contract successfully:", tx);
      setIsStored(true);
      onSuccess?.();
      
    } catch (error) {
      console.error("Failed to store summary in contract:", error);
      onError?.(error instanceof Error ? error.message : "Failed to store in contract");
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div className="border border-base-300 rounded-lg p-4 bg-base-200">
      <h3 className="text-lg font-semibold mb-2">Contract Storage</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">User Contract:</span> 
          <span className="ml-2 font-mono text-xs">
            {userContractAddress || "Not found"}
          </span>
        </div>
        
        <div>
          <span className="font-medium">Session ID:</span> 
          <span className="ml-2 font-mono text-xs">{sessionId}</span>
        </div>
        
        <div>
          <span className="font-medium">Summary Length:</span> 
          <span className="ml-2">{summary.summary.length} chars</span>
        </div>
      </div>

      <div className="mt-4">
        {!isStored ? (
          <button 
            onClick={handleStoreInContract}
            disabled={isStoring || !userContractAddress}
            className={`btn btn-primary btn-sm ${isStoring ? 'loading' : ''}`}
          >
            {isStoring ? "Storing..." : "Store in Contract"}
          </button>
        ) : (
          <div className="alert alert-success">
            <span>✓ Successfully stored in contract!</span>
          </div>
        )}
        
        {!userContractAddress && (
          <div className="alert alert-warning mt-2">
            <span>⚠ Please subscribe first to create your user contract</span>
          </div>
        )}
      </div>
    </div>
  );
};
