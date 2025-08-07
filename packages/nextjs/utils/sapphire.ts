import { isCalldataEnveloped, wrapEthereumProvider } from "@oasisprotocol/sapphire-paratime";

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

/**
 * Utility function to check if transaction calldata is encrypted
 * @param calldata - The transaction calldata to check
 * @returns boolean indicating if the calldata is encrypted
 */
export function isTransactionEncrypted(calldata: string): boolean {
  try {
    return isCalldataEnveloped(calldata);
  } catch (error) {
    console.error("Error checking calldata encryption:", error);
    return false;
  }
}

/**
 * Utility function to log transaction encryption status
 * @param txHash - Transaction hash
 * @param calldata - Transaction calldata
 */
export function logTransactionEncryption(txHash: string, calldata: string): void {
  const isEncrypted = isTransactionEncrypted(calldata);

  if (isEncrypted) {
    console.log(`✅ Transaction ${txHash} is encrypted (confidential)`);
  } else {
    console.log(`⚠️ Transaction ${txHash} is NOT encrypted (public)`);
  }
}

/**
 * Wraps an Ethereum provider for use with Oasis Sapphire
 * This enables confidential transactions when using Sapphire networks
 * @param provider - The Ethereum provider to wrap (e.g., window.ethereum)
 * @returns Wrapped provider that supports Sapphire confidential transactions
 */
export function getSapphireProvider(provider: any) {
  if (!provider) {
    throw new Error("No Ethereum provider found");
  }

  return wrapEthereumProvider(provider);
}

/**
 * Gets the wrapped window.ethereum provider for Sapphire if available
 * @returns Wrapped provider or null if not available
 */
export function getWrappedWindowEthereumProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return getSapphireProvider(window.ethereum);
  }

  console.warn("window.ethereum not available - using fallback");
  return null;
}
