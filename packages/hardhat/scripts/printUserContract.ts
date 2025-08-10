import { ethers } from "hardhat";

async function main() {
  console.log("🔎 Resolving current user's UserContract from ContractFactory...");

  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();
  console.log("User (signer):", userAddress);

  const factory = await ethers.getContract("ContractFactory", signer) as any;

  const userContractAddress = await factory.getUserContract(userAddress);
  console.log("UserContract:", userContractAddress);

  if (userContractAddress === ethers.ZeroAddress) {
    console.log("⚠️ No UserContract found for this address. Subscribe first.");
    process.exit(2);
  }
}

main().catch(err => {
  console.error("Failed to resolve user contract:", err);
  process.exit(1);
});



