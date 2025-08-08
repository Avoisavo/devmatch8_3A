import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing existing user logic with different addresses...");

  // Get current deployed addresses
  const subscriptionAddress = "0xd786a744875734F6119dc4AbF859EF6e5D20B453";
  const contractFactoryAddress = "0x0bFb180ffA4b964aCa946C9Dc38eBF39a34861a3";

  // Get signers
  const signers = await ethers.getSigners();
  const deployer = signers[0];

  console.log("Deployer:", deployer.address);

  // Get contract instances
  const subscriptionContract = await ethers.getContractAt("SubscriptionContract", subscriptionAddress, deployer);
  const contractFactory = await ethers.getContractAt(
    "contracts/ContractFactory.sol:ContractFactory",
    contractFactoryAddress,
    deployer,
  );

  const subscriptionPrice = await subscriptionContract.subscriptionPrice();
  console.log("Subscription price:", ethers.formatEther(subscriptionPrice), "ROSE");

  // Test 1: First subscription (should create new contract)
  console.log("\n🧪 Test 1: First subscription");
  const firstSubscribeTx = await subscriptionContract.subscribe({
    value: subscriptionPrice,
  });
  await firstSubscribeTx.wait();

  const firstUserContract = await contractFactory.getUserContract(deployer.address);
  console.log("First user contract:", firstUserContract);
  console.log("✅ First subscription completed");

  // Test 2: Second subscription (should return existing contract)
  console.log("\n🧪 Test 2: Second subscription (existing user)");
  const secondSubscribeTx = await subscriptionContract.subscribe({
    value: subscriptionPrice,
  });
  await secondSubscribeTx.wait();

  const secondUserContract = await contractFactory.getUserContract(deployer.address);
  console.log("Second user contract:", secondUserContract);

  if (firstUserContract === secondUserContract) {
    console.log("✅ SUCCESS! Same contract returned for existing user");
  } else {
    console.log("❌ ERROR! Different contracts returned");
  }

  // Test 3: Check total contracts (should still be 1 since same user)
  console.log("\n🧪 Test 3: Verify total contracts");
  const totalUserContracts = await contractFactory.getTotalUserContracts();
  const totalSubscribers = await subscriptionContract.totalSubscribers();

  console.log("Total user contracts:", totalUserContracts.toString());
  console.log("Total subscribers:", totalSubscribers.toString());

  if (totalUserContracts.toString() === "1") {
    console.log("✅ SUCCESS! Only 1 contract created for same user");
  } else {
    console.log("❌ ERROR! Multiple contracts created for same user");
  }

  // Test 4: Verify user contract details
  console.log("\n🧪 Test 4: Verify user contract details");
  const userContract = await ethers.getContractAt(
    "contracts/UserContract.sol:UserContract",
    firstUserContract,
    deployer,
  );

  const userInContract = await userContract.user();
  const subscriptionId = await userContract.subscriptionId();
  const isInitialized = await userContract.isInitialized();

  console.log("User in contract:", userInContract);
  console.log("Subscription ID:", subscriptionId.toString());
  console.log("Is Initialized:", isInitialized);

  if (userInContract === deployer.address) {
    console.log("✅ SUCCESS! User contract belongs to correct user");
  } else {
    console.log("❌ ERROR! User contract belongs to wrong user");
  }

  console.log("\n🎉 Existing user logic test completed!");
  console.log("Summary:");
  console.log("- Existing users get their old contract back");
  console.log("- No duplicate contracts created");
  console.log("- User contract stores correct user data");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
