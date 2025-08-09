import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  const latestNonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
  const pendingNonce = await ethers.provider.getTransactionCount(deployer.address, "pending");
  console.log("Nonce (latest):", latestNonce, "Nonce (pending):", pendingNonce);

  const Factory = await ethers.getContractFactory("SubscriptionAndSummaryFactory");
  const contract = await Factory.deploy();

  console.log("Deploy tx sent:", contract.deploymentTransaction()?.hash);
  const address = await contract.getAddress();
  console.log("SubscriptionAndSummaryFactory deployed at:", address);

  const oneMonth = await contract.ONE_MONTH();
  console.log("ONE_MONTH (seconds):", oneMonth.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
