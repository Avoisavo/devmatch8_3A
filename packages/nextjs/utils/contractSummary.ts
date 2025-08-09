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
  return `0x${Buffer.from(str, "utf8").toString("hex")}`;
};

// Convert bytes from contract to string
export const bytesToString = (bytes: `0x${string}`): string => {
  return Buffer.from(bytes.slice(2), "hex").toString("utf8");
};

// Hook for contract-based summary operations
export const useContractSummary = () => {
  const { address } = useAccount();

  // Get user's summary contract address from factory
  const { data: userContractAddress } = useScaffoldReadContract({
    contractName: "SubscriptionAndSummaryFactory",
    functionName: "userSummaryContract",
    args: [address],
  });

  // Store summary in user contract
  const storeSummaryInContract = async (
    sessionId: string,
    summary: string,
    writeContractAsync: any,
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

      // Call the contract
      const tx = await writeContractAsync({
        contractName: "UserSummaryStorage",
        functionName: "addSummary",
        args: [summaryBytes],
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
    bytesToString,
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

  // Get user's summary contract address
  const { data: userContractAddress } = useScaffoldReadContract({
    contractName: "SubscriptionAndSummaryFactory",
    functionName: "userSummaryContract",
    args: [address],
  });

  // Write contract hook - use the factory to create summary contracts
  const { writeContractAsync } = useScaffoldWriteContract("SubscriptionAndSummaryFactory");

  // Create new session in contract
  const createSession = async (): Promise<string | null> => {
    try {
      if (!userContractAddress || userContractAddress === "0x0000000000000000000000000000000000000000") {
        console.warn("User contract not found. Creating local session only.");
        return generateSessionId();
      }

      console.log("Getting or creating user summary contract:", userContractAddress);

      const tx = await writeContractAsync({
        functionName: "getOrCreateMySummaryContract",
      });

      console.log("Summary contract ready:", tx);
      // Generate a session ID for local tracking
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
    writeContractAsync,
  };
};
