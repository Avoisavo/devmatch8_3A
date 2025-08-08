import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing subscription flow...");

  // Get deployed contract addresses
  const subscriptionAddress = "0xd786a744875734F6119dc4AbF859EF6e5D20B453";
  const contractFactoryAddress = "0x15282dFE2d973645d36590fBfA2c821a9866CC3A";

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const testUser = signers.length > 1 ? signers[1] : deployer; // Use deployer as test user if only one signer

  console.log("Test user address:", testUser.address);
  console.log("Test user balance:", ethers.formatEther(await testUser.provider.getBalance(testUser.address)), "ROSE");

  // Get contract instances
  const subscriptionContract = await ethers.getContractAt("SubscriptionContract", subscriptionAddress, testUser);

  const contractFactory = await ethers.getContractAt(
    "contracts/ContractFactory.sol:ContractFactory",
    contractFactoryAddress,
    deployer,
  );

  // Check initial state
  console.log("\n📊 Initial state:");
  const initialSubscribers = await subscriptionContract.totalSubscribers();
  const initialUserContracts = await contractFactory.getTotalUserContracts();
  console.log("Total subscribers:", initialSubscribers.toString());
  console.log("Total user contracts:", initialUserContracts.toString());

  // Test subscription (should create user contract automatically)
  console.log("\n💰 User subscribing with 1 ROSE...");
  const subscriptionPrice = await subscriptionContract.subscriptionPrice();
  console.log("Subscription price:", ethers.formatEther(subscriptionPrice), "ROSE");

  const subscribeTx = await subscriptionContract.subscribe({
    value: subscriptionPrice,
  });

  console.log("📝 Transaction sent, waiting for confirmation...");
  await subscribeTx.wait();
  console.log("✅ Subscription completed!");

  // Check if user contract was created
  const userContractAddress = await contractFactory.getUserContract(testUser.address);
  console.log("\n🏠 User contract address:", userContractAddress);

  if (userContractAddress !== ethers.ZeroAddress) {
    console.log("🎉 SUCCESS! User contract was created automatically!");

    // Get user contract instance to check details
    const userContract = await ethers.getContractAt(
      "contracts/UserContract.sol:UserContract",
      userContractAddress,
      testUser,
    );
    const userInContract = await userContract.user();
    const subscriptionId = await userContract.subscriptionId();
    const isInitialized = await userContract.isInitialized();

    console.log("📋 User contract details:");
    console.log("  - User:", userInContract);
    console.log("  - Subscription ID:", subscriptionId.toString());
    console.log("  - Is Initialized:", isInitialized);

    // Verify final state
    const finalSubscribers = await subscriptionContract.totalSubscribers();
    const finalUserContracts = await contractFactory.getTotalUserContracts();
    console.log("\n📊 Final state:");
    console.log("Total subscribers:", finalSubscribers.toString());
    console.log("Total user contracts:", finalUserContracts.toString());
  } else {
    console.log("❌ ERROR: User contract was not created");
  }

  console.log("\n✨ This UserContract can now store encrypted chat summaries!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
