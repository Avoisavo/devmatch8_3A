import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
// import type { ChatSummary } from "./chatSummary";

// Simple encryption utility (for demo - in production use proper encryption)
export const encryptSummary = (summary: string): string => {
  // Simple base64 encoding for now - replace with proper encryption
  return btoa(summary);
};

export const decryptSummary = (encryptedData: string): string => {
  try {
    return atob(encryptedData);
  } catch (error) {
    console.error("Failed to decrypt summary:", error);
    return "Failed to decrypt summary";
  }
};

// Convert string to bytes for contract storage
export const stringToBytes = (str: string): `0x${string}` => {
  return `0x${Buffer.from(str, 'utf8').toString('hex')}`;
};

// Convert bytes from contract to string
export const bytesToString = (bytes: `0x${string}`): string => {
  return Buffer.from(bytes.slice(2), 'hex').toString('utf8');
};

// Hook for contract-based summary operations
export const useContractSummary = () => {
  const { address } = useAccount();

  // Get user's contract address from factory
  const { data: userContractAddress } = useScaffoldReadContract({
    contractName: "ContractFactory",
    functionName: "getUserContract",
    args: [address],
  });

  // Store summary in user contract
  const storeSummaryInContract = async (
    sessionId: string,
    summary: string,
    writeContractAsync: any
  ): Promise<boolean> => {
    try {
      if (!userContractAddress || userContractAddress === "0x0000000000000000000000000000000000000000") {
        throw new Error("User contract not found. Please subscribe first.");
      }

      console.log("Storing summary in contract:", userContractAddress);
      console.log("Session ID:", sessionId);
      console.log("Summary preview:", summary.substring(0, 100) + "...");

      // Encrypt and convert summary to bytes
      const encryptedSummary = encryptSummary(summary);
      const summaryBytes = stringToBytes(encryptedSummary);
      const sessionIdBytes = `0x${sessionId}` as `0x${string}`;

      // Call the contract
      const tx = await writeContractAsync({
        contractName: "UserContract", 
        functionName: "storeChatSummary",
        args: [sessionIdBytes, summaryBytes],
        address: userContractAddress,
      });

      console.log("Summary stored in contract successfully:", tx);
      return true;
    } catch (error) {
      console.error("Failed to store summary in contract:", error);
      return false;
    }
  };

  return {
    userContractAddress,
    storeSummaryInContract,
    encryptSummary,
    decryptSummary,
    stringToBytes,
    bytesToString
  };
};

// Session management utilities
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${timestamp}_${random}`;
};

export const useSessionManagement = () => {
  const { address } = useAccount();
  
  // Get user's contract address
  const { data: userContractAddress } = useScaffoldReadContract({
    contractName: "ContractFactory",
    functionName: "getUserContract",
    args: [address],
  });

  // Write contract hook - don't specify contractName for dynamic address usage
  const { writeContractAsync } = useScaffoldWriteContract("UserContract");

  // Create new session in contract
  const createSession = async (): Promise<string | null> => {
    try {
      if (!userContractAddress || userContractAddress === "0x0000000000000000000000000000000000000000") {
        console.warn("User contract not found. Creating local session only.");
        return generateSessionId();
      }

      console.log("Creating new session in contract:", userContractAddress);
      
      const tx = await writeContractAsync({
        functionName: "createNewSession",
      });

      console.log("New session created:", tx);
      // The actual session ID would be in the transaction receipt/events
      // For now, generate a local session ID
      return generateSessionId();
    } catch (error) {
      console.error("Failed to create session in contract:", error);
      // Fallback to local session
      return generateSessionId();
    }
  };

  return {
    userContractAddress,
    createSession,
    writeContractAsync
  };
};
