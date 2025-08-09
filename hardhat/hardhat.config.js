const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("@nomicfoundation/hardhat-toolbox");

// Put your private key directly here to use it for deployment.
// IMPORTANT: Do NOT commit a real private key to a public repository.
// Example format: "0xabcdef..." (with or without the 0x prefix is fine)
const PRIVATE_KEY_IN_CONFIG = ""; // <--- paste your private key between the quotes

function normalizePk(pk) {
  if (!pk) return undefined;
  return pk.startsWith("0x") ? pk : `0x${pk}`;
}

// Prefer the key in this config; fallback to env PRIVATE_KEY if left empty
const FINAL_PRIVATE_KEY = normalizePk(PRIVATE_KEY_IN_CONFIG) || normalizePk(process.env.PRIVATE_KEY);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    // Oasis Sapphire Testnet configuration
    sapphireTestnet: {
      url: process.env.SAPPHIRE_TESTNET_RPC_URL || "https://testnet.sapphire.oasis.dev",
      chainId: 23295,
      accounts: FINAL_PRIVATE_KEY ? [FINAL_PRIVATE_KEY] : [],
    },
  },
};
