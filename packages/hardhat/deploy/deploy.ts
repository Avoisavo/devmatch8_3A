// Deployment script: deploy factory, pay for subscription, and auto-create per-user storage
// - Deploys SubscriptionAndSummaryFactory
// - Calls factory.paySubscription with value; contract auto-creates UserSummaryStorage for the payer
//
// Usage:
//   npx hardhat run scripts/deploy.ts --network sapphireTestnet
//
// Notes:
// - Paste your private key if you want to use an external account; otherwise it will fallback to the first Hardhat signer.

import hre from "hardhat";
import type { Signer, Wallet } from "ethers";
import type { SubscriptionAndSummaryFactory } from "../typechain-types/contracts/UserSummaryFactory.sol/SubscriptionAndSummaryFactory";

const { ethers, network } = hre;

// Paste your private key here (with or without 0x). Leave blank to use Hardhat's default signer.
const PRIVATE_KEY: string = "288aa8133097655bd084faae22fee9724ffe078c8aa3223417abb630ed2dc757"; // <--- paste your private key here if needed

// How much ETH to send as the subscription payment (string, in ETH units)
const PAYMENT_ETH: string = "0.01";

function normalizePk(pk?: string): string | undefined {
  if (!pk) return undefined;
  return pk.startsWith("0x") ? pk : `0x${pk}`;
}

async function main(): Promise<void> {
  console.log("Network:", network.name);

  let deployer: Signer | Wallet;
  if (PRIVATE_KEY && PRIVATE_KEY.trim().length > 0) {
    const normalized = normalizePk(PRIVATE_KEY.trim());
    if (!normalized) {
      throw new Error("Invalid private key format.");
    }
    deployer = new ethers.Wallet(normalized, ethers.provider);
  } else {
    const signers = await ethers.getSigners();
    if (!signers || signers.length === 0) {
      throw new Error("No signers available. Paste your PRIVATE_KEY in scripts/deploy.ts and try again.");
    }
    deployer = signers[0];
  }

  const deployerAddress: string =
    (deployer as any).address ||
    (typeof (deployer as any).getAddress === "function" ? await (deployer as any).getAddress() : undefined);

  if (!deployerAddress) {
    throw new Error("Could not determine deployer address.");
  }

  const balance = await ethers.provider.getBalance(deployerAddress);
  console.log("Deployer:", deployerAddress);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  // 1) Deploy the factory
  const Factory = await ethers.getContractFactory("SubscriptionAndSummaryFactory", deployer);
  console.log("Deploying SubscriptionAndSummaryFactory...");
  const factory = (await Factory.deploy()) as SubscriptionAndSummaryFactory;
  await factory.waitForDeployment();

  const factoryAddress: string =
    typeof (factory as any).getAddress === "function" ? await (factory as any).getAddress() : (factory as any).target;

  console.log("SubscriptionAndSummaryFactory deployed at:", factoryAddress);

  // 2) Pay for subscription; the contract will auto-create the storage for the payer
  console.log(`Paying subscription of ${PAYMENT_ETH} ETH to auto-create storage...`);
  const payTx = await factory.paySubscription({ value: ethers.parseEther(PAYMENT_ETH) });
  await payTx.wait();
  console.log("Subscription paid.");

  // 3) Read the mapped address back from the factory for the payer (deployer)
  const storageAddress: string = await factory.userSummaryContract(deployerAddress);
  console.log("UserSummaryStorage deployed/linked at:", storageAddress);

  // Optional: check active status
  const active: boolean = await factory.isActive(deployerAddress);
  console.log("Subscription active:", active);

  console.log("Deployment complete.\n- Factory:", factoryAddress, "\n- UserSummaryStorage:", storageAddress);
}

main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
