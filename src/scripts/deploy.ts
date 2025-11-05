import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account :", deployer.address);

  const contractFactory = await ethers.getContractFactory("GardenNFT")
  const contract = await contractFactory.deploy()
  const contractAddress = await contract.getAddress()

  console.log("Contract deployed to  :", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Deployer Address       : 0xE6A7d99011257AEc28Ad60EFED58A256c4d5Fea3
// IDRT Address           : 0xb4a911eC34eDaaEFC393c52bbD926790B9219df4
// PG Address MAIN        : 0xe12471376774990223DBEfD9Ce37d00F182B8108
// PG V3 Address MAIN     : 0xC2Bbc9b56e496fA23e543018f7d0ED360453C3C6
// PG Aerodome Address    : 0xd002E6E1D1c9fFc150DB0d59EAE2dEc9521d9c3F // BASE
// PG Velodrome Address   : 0x0B841687C751bE4Db897a1B0EC24418294CEfad2 // LISK
// PG LiFi Address        : 0x2CADBCcaA7989fB52B1Cc65569ee5e61A9E4F8eB // BASE
// PG Uniswap Address     : 0x463Cd1fc6dD2590808e3C4B5C351aA6A2EBF765f // BASE
// PG Aerodome Address    : 0x86b15744F1CC682e8a7236Bb7B2d02dA957958aD // LISK
// PG Aerodome Universal  : 0xF5475B736870929f9fb44CDEF5fa7A0544C64D28
// PG Address TEST        : 0xF043b0b91C8F5b6C2DC63897f1632D6D15e199A9

// Uniswap Router BASE    : 0x2626664c2603336E57B271c5C0b26F421741e481
// Uniswap Router LISK    : 0x1b35fbA9357fD9bda7ed0429C8BbAbe1e8CC88fc
// Velodrome Router OP    : 0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858 && 0x9c12939390052919af3155f41bf4160fd3666a6f 
// Velodrome Router LISK  : 0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858