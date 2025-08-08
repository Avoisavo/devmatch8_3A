import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys UserContract template and updates ContractFactory
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployUserContractAndUpdateFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying UserContract template to Sapphire network...");
  console.log("Deployer address:", deployer);

  // Deploy UserContract template
  console.log("📋 Deploying UserContract template...");
  const userContractTemplate = await deploy("UserContract", {
    from: deployer,
    contract: "contracts/UserContract.sol:UserContract",
    args: [], // UserContract will be initialized later
    log: true,
    autoMine: true,
    // Add gas settings for Oasis Sapphire networks
    ...(hre.network.name.includes("sapphire")
      ? {
          gasLimit: 3000000, // Higher gas limit for template deployment
          gasPrice: "100000000000", // 100 gwei
        }
      : {}),
  });

  console.log("✅ UserContract template deployed at:", userContractTemplate.address);

  // Get the existing ContractFactory
  const contractFactory = await hre.ethers.getContract<Contract>("ContractFactory", deployer);

  // Update the factory with the new template address
  console.log("🏭 Updating ContractFactory with new template...");
  const updateTx = await contractFactory.setUserContractTemplate(userContractTemplate.address);
  await updateTx.wait();

  console.log("✅ ContractFactory updated with new template");

  // Get updated factory information
  const factoryInfo = await contractFactory.getFactoryInfo();
  console.log("📊 Updated Factory Information:");
  console.log("  - Subscription Contract:", factoryInfo[0]);
  console.log("  - User Contract Template:", factoryInfo[1]);
  console.log("  - Total User Contracts:", factoryInfo[2].toString());
  console.log("  - Factory Version:", factoryInfo[3].toString());

  console.log("🎉 UserContract deployment and factory update complete!");
  console.log("Next step: Update SubscriptionContract with factory address");
};

export default deployUserContractAndUpdateFactory;
