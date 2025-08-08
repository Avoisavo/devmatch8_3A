import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys ContractFactory and UserContract template
 * Note: This script should be run AFTER UserContract is deployed
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployContractFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying ContractFactory to Sapphire network...");
  console.log("Deployer address:", deployer);

  // First, deploy UserContract template (if not already deployed)
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

  // Then, deploy ContractFactory with the template address
  console.log("🏭 Deploying ContractFactory...");
  const contractFactory = await deploy("ContractFactory", {
    from: deployer,
    contract: "contracts/ContractFactory.sol:ContractFactory",
    args: [deployer, userContractTemplate.address], // owner, userContractTemplate
    log: true,
    autoMine: true,
    // Add gas settings for Oasis Sapphire networks
    ...(hre.network.name.includes("sapphire")
      ? {
          gasLimit: 2000000,
          gasPrice: "100000000000", // 100 gwei
        }
      : {}),
  });

  console.log("✅ ContractFactory deployed at:", contractFactory.address);

  // Get the deployed contracts to interact with them
  const factoryContract = await hre.ethers.getContract<Contract>("ContractFactory", deployer);

  // Log factory information
  const factoryInfo = await factoryContract.getFactoryInfo();
  console.log("📊 Factory Information:");
  console.log("  - Subscription Contract:", factoryInfo[0]);
  console.log("  - User Contract Template:", factoryInfo[1]);
  console.log("  - Total User Contracts:", factoryInfo[2].toString());
  console.log("  - Factory Version:", factoryInfo[3].toString());

  console.log("🎉 ContractFactory deployment complete!");
  console.log("Next step: Update SubscriptionContract with factory address");
};

export default deployContractFactory;
