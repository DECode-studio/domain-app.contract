import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account :", deployer.address);

  const contractFactory = await ethers.getContractFactory("DomainFoundation")
  const contract = await contractFactory.deploy()
  const contractAddress = await contract.getAddress()

  console.log("Contract deployed to  :", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Deployer Address       : 0xE6A7d99011257AEc28Ad60EFED58A256c4d5Fea3
// Domain Address         : 0xc119a5F83CFc4CF12f5Fa9b2bFFcc6619b57B8D1