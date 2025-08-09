"use client";

import { useState, useEffect } from "react";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { SiweMessage } from "siwe";
import { ethers } from "ethers";
import { notification } from "~~/utils/scaffold-eth";

// OwnerMessage contract ABI (ethers human-readable format)
const OWNER_MESSAGE_ABI = [
  "function owner() view returns (address)",
  "function domain() view returns (string)",
  "function getMessage(bytes token) view returns (string)",
  "function setMessage(string newMessage, bytes token)",
  "function login(string siweMsg, (bytes32 r, bytes32 s, uint256 v) sig) view returns (bytes)"
];

// Contract address from deployment
const OWNER_MESSAGE_ADDRESS = "0x579C47310e0F98427cA52deb900eC3096C14C38a";

export default function SiweTestPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [owner, setOwner] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize contract
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && isConnected) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contractInstance = new ethers.Contract(OWNER_MESSAGE_ADDRESS, OWNER_MESSAGE_ABI, provider);
      setContract(contractInstance);
      
      // Load contract data
      loadContractData(contractInstance);
    }
  }, [isConnected]);

  const loadContractData = async (contractInstance: ethers.Contract) => {
    try {
      const [ownerAddr, domainStr] = await Promise.all([
        contractInstance.owner(),
        contractInstance.domain()
      ]);
      setOwner(ownerAddr);
      setDomain(domainStr);
    } catch (err) {
      console.error("Failed to load contract data:", err);
    }
  };

  // Check if current user is owner
  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // SIWE Authentication
  const signInWithEthereum = async () => {
    try {
      if (!address || !domain || !contract) {
        throw new Error("Wallet not connected or contract not loaded");
      }

      setLoading(true);
      setError(null);

      // Generate nonce
      const nonce = Math.random().toString(36).substring(2, 10);

      // Create SIWE message
      const siweMessage = new SiweMessage({
        domain: domain,
        address: address,
        uri: `http://${domain}`,
        version: "1",
        chainId: chainId,
        statement: "Sign in to access your secret message on Oasis Sapphire",
        nonce: nonce,
        issuedAt: new Date().toISOString(),
      });

      const messageToSign = siweMessage.prepareMessage();
      console.log("SIWE Message:", messageToSign);

      // Sign the message
      const signature = await signMessageAsync({ message: messageToSign });
      console.log("Signature:", signature);

      // Parse signature into RSV format
      const sig = ethers.Signature.from(signature);
      const sigRSV = {
        r: sig.r,
        s: sig.s,
        v: sig.v
      };
      
      console.log("Parsed signature RSV:", sigRSV);

      // Login to contract (this is a view function, no transaction needed)
      const authToken = await contract.login(messageToSign, sigRSV);
      console.log("Auth token received:", authToken);

      // Use the returned token for authentication
      setAuthToken(ethers.hexlify(authToken));
      setIsAuthenticated(true);
      
      notification.success("Successfully authenticated with SIWE!");
    } catch (err: any) {
      console.error("SIWE Authentication failed:", err);
      setError(`Authentication failed: ${err.message}`);
      notification.error("SIWE Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  // Get secret message
  const getSecretMessage = async () => {
    try {
      if (!isAuthenticated || !authToken || !contract) {
        throw new Error("Not authenticated or contract not loaded");
      }

      setLoading(true);
      setError(null);

      // Use the auth token directly (it's already in bytes format)
      const message = await contract.getMessage(authToken);
      setSecretMessage(message);
      
      notification.success("Secret message retrieved!");
    } catch (err: any) {
      console.error("Failed to get message:", err);
      setError(`Failed to get message: ${err.message}`);
      notification.error("Failed to get secret message");
    } finally {
      setLoading(false);
    }
  };

  // Set new message
  const updateMessage = async () => {
    try {
      if (!isAuthenticated || !authToken || !newMessage.trim() || !contract) {
        throw new Error("Not authenticated, message is empty, or contract not loaded");
      }

      setLoading(true);
      setError(null);

      // Get signer for transactions
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as ethers.Contract;

      // Use the auth token directly (it's already in bytes format)
      const tx = await contractWithSigner.setMessage(newMessage, authToken);
      await tx.wait();

      console.log("Update message transaction:", tx);
      setNewMessage("");
      
      notification.success("Message updated successfully!");

      // Refresh the secret message
      setTimeout(() => getSecretMessage(), 1000);
    } catch (err: any) {
      console.error("Failed to set message:", err);
      setError(`Failed to set message: ${err.message}`);
      notification.error("Failed to update message");
    } finally {
      setLoading(false);
    }
  };

  // Disconnect
  const disconnect = () => {
    setIsAuthenticated(false);
    setAuthToken("");
    setSecretMessage("");
    setNewMessage("");
    setError(null);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">🔒 SIWE Test Page</h1>
          <div className="bg-warning/20 border border-warning rounded-lg p-6 text-center">
            <p className="text-lg mb-4">Please connect your wallet to test SIWE authentication</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">🔒 SIWE Authentication Test</h1>
        
        {/* Contract Info */}
        <div className="bg-base-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">📋 Contract Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Your Address:</span>
              <div className="font-mono bg-base-300 p-2 rounded mt-1 break-all">
                {address}
              </div>
            </div>
            <div>
              <span className="font-medium">Contract Owner:</span>
              <div className="font-mono bg-base-300 p-2 rounded mt-1 break-all">
                {owner || "Loading..."}
              </div>
            </div>
            <div>
              <span className="font-medium">Domain:</span>
              <div className="font-mono bg-base-300 p-2 rounded mt-1">
                {domain || "Loading..."}
              </div>
            </div>
            <div>
              <span className="font-medium">Chain ID:</span>
              <div className="font-mono bg-base-300 p-2 rounded mt-1">
                {chainId}
              </div>
            </div>
          </div>
          
          {/* Owner Status */}
          <div className="mt-4">
            <div className={`badge ${isOwner ? "badge-success" : "badge-warning"}`}>
              {isOwner ? "✓ You are the owner" : "⚠ You are not the owner"}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-error mb-6">
            <span>❌ {error}</span>
          </div>
        )}

        {/* Authentication Section */}
        {!isAuthenticated ? (
          <div className="bg-base-100 rounded-lg p-6 mb-6 border">
            <h3 className="text-xl font-semibold mb-4">🔐 Authentication Required</h3>
            <p className="mb-4 text-base-content/70">
              Sign a SIWE (Sign-In with Ethereum) message to authenticate and access the secret message.
            </p>
            <button 
              onClick={signInWithEthereum}
              disabled={loading || !isOwner}
              className={`btn btn-primary ${loading ? "loading" : ""}`}
            >
              {loading ? "Signing In..." : "✍️ Sign In with Ethereum"}
            </button>
            {!isOwner && (
              <p className="text-warning text-sm mt-2">
                ⚠ Only the contract owner can authenticate
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Authenticated Status */}
            <div className="bg-success/20 border border-success rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 text-success">✅ Successfully Authenticated!</h3>
              <p className="text-success/80">You can now access and manage the secret message.</p>
              <button 
                onClick={disconnect}
                className="btn btn-outline btn-sm mt-4"
              >
                Disconnect
              </button>
            </div>

            {/* Get Secret Message */}
            <div className="bg-base-100 rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">📖 Read Secret Message</h3>
              <button 
                onClick={getSecretMessage}
                disabled={loading}
                className={`btn btn-info ${loading ? "loading" : ""}`}
              >
                {loading ? "Loading..." : "🔍 Get Secret Message"}
              </button>
              
              {secretMessage && (
                <div className="mt-4 p-4 bg-info/10 border border-info rounded-lg">
                  <div className="font-semibold text-info mb-2">🔒 Secret Message:</div>
                  <div className="bg-base-200 p-3 rounded font-mono break-words">
                    {secretMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Set New Message */}
            <div className="bg-base-100 rounded-lg p-6 border">
              <h3 className="text-xl font-semibold mb-4">✏️ Update Secret Message</h3>
              <div className="space-y-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Enter new secret message..."
                  className="textarea textarea-bordered w-full min-h-[100px]"
                />
                <button 
                  onClick={updateMessage}
                  disabled={loading || !newMessage.trim()}
                  className={`btn btn-warning ${loading ? "loading" : ""}`}
                >
                  {loading ? "Updating..." : "💾 Update Message"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="bg-base-200 rounded-lg p-6 mt-8">
          <h4 className="text-lg font-semibold mb-4">ℹ️ How SIWE Works</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-base-content/80">
            <li><strong>Connect Wallet:</strong> Connect your MetaMask to the local network</li>
            <li><strong>SIWE Authentication:</strong> Sign a standardized message to prove wallet ownership</li>
            <li><strong>Token Generation:</strong> Contract verifies signature and generates access token</li>
            <li><strong>Confidential Access:</strong> Use token to access encrypted data</li>
            <li><strong>Privacy:</strong> Ready for Oasis Sapphire's confidential EVM integration</li>
          </ol>
          
          <div className="mt-4 p-3 bg-primary/10 border border-primary rounded text-sm">
            <strong className="text-primary">🔐 Note:</strong> This is a test implementation running on local hardhat. 
            When deployed to Oasis Sapphire, all data will be automatically encrypted using the confidential EVM.
          </div>
        </div>
      </div>
    </div>
  );
}