"use client";

import { useState } from "react";
import { useSummaryCrypto } from "../../hooks/useSummaryCrypto";
import { useAccount } from "wagmi";

export default function EncryptTestPage() {
  const { address } = useAccount();
  const { encrypt, decrypt } = useSummaryCrypto();

  const [plaintext, setPlaintext] = useState<string>('{\n  "hello": "world"\n}');
  const [envelope, setEnvelope] = useState<string>("");
  const [decrypted, setDecrypted] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleEncrypt = async () => {
    try {
      setStatus("Encrypting...");
      const env = await encrypt(plaintext);
      setEnvelope(env);
      setStatus("Encrypted. You can now decrypt.");
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`);
    }
  };

  const handleDecrypt = async () => {
    try {
      setStatus("Decrypting...");
      // Accept both raw JSON object and JSON-escaped string
      const normalized = (() => {
        const txt = envelope.trim();
        try {
          const once = JSON.parse(txt);
          if (typeof once === "string") {
            // It was a JSON string containing JSON → parse second time
            try {
              JSON.parse(once); // validate
              return once;
            } catch {
              return once; // let decrypt handle/throw
            }
          }
          // It is already an object → stringify
          return JSON.stringify(once);
        } catch {
          // Not JSON at all; pass as-is
          return txt;
        }
      })();
      const pt = await decrypt(normalized);
      setDecrypted(pt);
      setStatus("Decrypted successfully.");
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Summary Encryption Test (Wallet-signature AES-GCM)</h1>
      <div className="text-sm opacity-70">Connected: {address ?? "(not connected)"}</div>

      <label className="form-control w-full">
        <div className="label">
          <span className="label-text">Plaintext JSON</span>
        </div>
        <textarea
          className="textarea textarea-bordered w-full h-40"
          value={plaintext}
          onChange={e => setPlaintext(e.target.value)}
        />
      </label>

      <div className="flex gap-3">
        <button className="btn btn-primary" onClick={handleEncrypt}>
          Encrypt
        </button>
        <button className="btn" onClick={handleDecrypt} disabled={!envelope}>
          Decrypt
        </button>
      </div>

      {status && <div className="alert mt-2">{status}</div>}

      <label className="form-control w-full mt-4">
        <div className="label">
          <span className="label-text">Ciphertext Envelope (paste here to decrypt)</span>
        </div>
        <textarea
          className="textarea textarea-bordered w-full h-40"
          value={envelope}
          onChange={e => setEnvelope(e.target.value)}
        />
      </label>

      {decrypted && (
        <div className="mt-4">
          <div className="font-semibold mb-1">Decrypted Plaintext:</div>
          <pre className="whitespace-pre-wrap break-all bg-base-200 p-3 rounded">{decrypted}</pre>
        </div>
      )}
    </div>
  );
}
