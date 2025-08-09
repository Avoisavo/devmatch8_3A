import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the OwnerMessage contract for SIWE testing
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployOwnerMessage: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Get domain from environment or use default
  const domain = process.env.DOMAIN || "localhost:3000";
  const initialMessage = process.env.INITIAL_MESSAGE || "Hello from Oasis Sapphire!";
  
  // Use custom owner if specified, otherwise use deployer
  const customOwner = process.env.CUSTOM_OWNER;
  const contractOwner = customOwner || deployer;

  console.log("Deploying OwnerMessage with:");
  console.log("  Deployer:", deployer);
  console.log("  Contract Owner:", contractOwner);
  console.log("  Initial Message:", initialMessage);
  console.log("  Domain:", domain);

  await deploy("OwnerMessage", {
    from: deployer,
    // Contract constructor arguments
    args: [initialMessage, domain, contractOwner],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const ownerMessage = await hre.ethers.getContract<Contract>("OwnerMessage", deployer);
  console.log("👋 OwnerMessage deployed to:", await ownerMessage.getAddress());
  console.log("👤 Owner:", await ownerMessage.owner());
  console.log("🌐 Domain:", await ownerMessage.domain());
  console.log("📝 Note: Use SIWE authentication to access the secret message");
};

export default deployOwnerMessage;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags OwnerMessage
deployOwnerMessage.tags = ["OwnerMessage"];
