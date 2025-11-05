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
// Domain Address         : 0x70fFDCA1D2741a6Ae496B3E6A1Fe9835832b37a0