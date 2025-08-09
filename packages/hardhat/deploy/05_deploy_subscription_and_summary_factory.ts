import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the SubscriptionAndSummaryFactory contract.
 * This factory manages subscription payments and per-user UserSummaryStorage deployments.
 */
const deploySubscriptionAndSummaryFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("🚀 Deploying SubscriptionAndSummaryFactory...");
  console.log("Deployer:", deployer);

  const deployment = await deploy("SubscriptionAndSummaryFactory", {
    from: deployer,
    contract: "contracts/UserSummaryFactory.sol:SubscriptionAndSummaryFactory",
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ SubscriptionAndSummaryFactory deployed at:", deployment.address);

  // Fetch a typed contract instance to show some initial state/info
  const factory = await hre.ethers.getContract<Contract>("SubscriptionAndSummaryFactory", deployer);
  const oneMonth = await factory.ONE_MONTH();
  console.log("🗓️  ONE_MONTH (seconds):", oneMonth.toString());
};

export default deploySubscriptionAndSummaryFactory;

deploySubscriptionAndSummaryFactory.tags = ["SubscriptionAndSummaryFactory"];