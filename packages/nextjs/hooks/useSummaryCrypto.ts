"use client";

import { useCallback, useRef } from "react";
import { useAccount, useSignMessage } from "wagmi";

// Fixed, domain-separated message. Changing this will change the derived key.
const KEY_DERIVATION_MESSAGE_PREFIX = "Summary Encryption Key v1" as const;

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) throw new Error("Invalid hex");
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  // Browser-safe base64 conversion
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

async function importAesKey(rawKeyBytes: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", rawKeyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function deriveKeyBytes(signatureHex: string, salt: Uint8Array): Promise<Uint8Array> {
  // Derivation: SHA-256( signature_bytes || salt ) → 32 bytes
  const sigBytes = hexToBytes(signatureHex);
  const input = new Uint8Array(sigBytes.length + salt.length);
  input.set(sigBytes, 0);
  input.set(salt, sigBytes.length);
  return sha256(input);
}

export type EncryptedEnvelope = {
  v: number; // version
  alg: "AES-GCM";
  salt: string; // base64
  iv: string; // base64
  ct: string; // base64
};

export function useSummaryCrypto() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  // Cache the last signature to avoid prompting the user repeatedly in a session
  const cachedSignatureRef = useRef<string | null>(null);

  const getOrSign = useCallback(async (): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");
    if (cachedSignatureRef.current) return cachedSignatureRef.current;
    const message = `${KEY_DERIVATION_MESSAGE_PREFIX}\nAddress: ${address}`;
    const sig = await signMessageAsync({ message });
    cachedSignatureRef.current = sig;
    return sig;
  }, [address, signMessageAsync]);

  const encrypt = useCallback(
    async (plaintext: string): Promise<string> => {
      const signature = await getOrSign();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const keyBytes = await deriveKeyBytes(signature, salt);
      const key = await importAesKey(keyBytes);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const enc = new TextEncoder();
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));

      const envelope: EncryptedEnvelope = {
        v: 1,
        alg: "AES-GCM",
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        ct: bytesToBase64(new Uint8Array(ciphertext)),
      };
      return JSON.stringify(envelope);
    },
    [getOrSign],
  );

  const decrypt = useCallback(
    async (envelopeJson: string): Promise<string> => {
      const signature = await getOrSign();
      const env: EncryptedEnvelope = JSON.parse(envelopeJson);
      if (env.v !== 1 || env.alg !== "AES-GCM") throw new Error("Unsupported envelope format");
      const salt = base64ToBytes(env.salt);
      const iv = base64ToBytes(env.iv);
      const ct = base64ToBytes(env.ct);

      const keyBytes = await deriveKeyBytes(signature, salt);
      const key = await importAesKey(keyBytes);
      const plaintextBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      return new TextDecoder().decode(plaintextBuf);
    },
    [getOrSign],
  );

  return { encrypt, decrypt };
}
