import { ethers } from "hardhat";

async function main() {
  console.log("🔗 Connecting SubscriptionContract to ContractFactory...");

  // Get deployed contract addresses (from deployments)
  const subscriptionAddress = "0xd786a744875734F6119dc4AbF859EF6e5D20B453";
  const contractFactoryAddress = "0x15282dFE2d973645d36590fBfA2c821a9866CC3A";

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Using signer:", signer.address);

  // Get contract instances
  const subscriptionContract = await ethers.getContractAt("SubscriptionContract", subscriptionAddress, signer);

  const contractFactory = await ethers.getContractAt(
    "contracts/ContractFactory.sol:ContractFactory",
    contractFactoryAddress,
    signer,
  );

  // 1. Set ContractFactory address in SubscriptionContract
  console.log("📝 Setting ContractFactory address in SubscriptionContract...");
  const setFactoryTx = await subscriptionContract.setContractFactory(contractFactoryAddress);
  await setFactoryTx.wait();
  console.log("✅ ContractFactory address set in SubscriptionContract");

  // 2. Set SubscriptionContract address in ContractFactory
  console.log("📝 Setting SubscriptionContract address in ContractFactory...");
  const setSubscriptionTx = await contractFactory.setSubscriptionContract(subscriptionAddress);
  await setSubscriptionTx.wait();
  console.log("✅ SubscriptionContract address set in ContractFactory");

  // 3. Verify the connections
  console.log("\n🔍 Verifying connections...");

  const factoryInSubscription = await subscriptionContract.contractFactory();
  console.log("ContractFactory in SubscriptionContract:", factoryInSubscription);

  const factoryInfo = await contractFactory.getFactoryInfo();
  console.log("SubscriptionContract in ContractFactory:", factoryInfo[0]);
  console.log("UserContract Template:", factoryInfo[1]);
  console.log("Total User Contracts:", factoryInfo[2].toString());

  console.log("\n🎉 All contracts are now connected!");
  console.log("📋 Flow summary:");
  console.log("1. User calls SubscriptionContract.subscribe() with 1 ROSE");
  console.log("2. SubscriptionContract calls ContractFactory.createUserContract()");
  console.log("3. ContractFactory creates a new UserContract for the user");
  console.log("4. UserContract can store encrypted chat summaries");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
