import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "SubscriptionContract" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySubscriptionContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("SubscriptionContract", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
    // Add gas settings for Oasis Sapphire networks
    ...(hre.network.name.includes("sapphire")
      ? {
          gasLimit: 2000000,
          gasPrice: "100000000000", // 100 gwei
        }
      : {}),
  });

  // Get the deployed contract to interact with it after deploying.
  const subscriptionContract = await hre.ethers.getContract<Contract>("SubscriptionContract", deployer);
  console.log("💰 Subscription price:", await subscriptionContract.subscriptionPrice());
  console.log("👥 Total subscribers:", await subscriptionContract.totalSubscribers());
};

export default deploySubscriptionContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags SubscriptionContract
deploySubscriptionContract.tags = ["SubscriptionContract"];
