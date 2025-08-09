import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const siweDomain = process.env.SIWE_DOMAIN || (hre.network.name.includes("sapphire") ? "sapphire" : "localhost");

  await deploy("SummaryVault", {
    from: deployer,
    args: [siweDomain],
    log: true,
    autoMine: true,
    ...(hre.network.name.includes("sapphire")
      ? {
          gasLimit: 2_000_000,
          gasPrice: "100000000000", // 100 gwei
        }
      : {}),
  });
};

export default func;
func.tags = ["SummaryVault"];
