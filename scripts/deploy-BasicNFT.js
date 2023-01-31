const hre = require("hardhat");



async function main() {
    const BasicNFT = await hre.ethers.getContractFactory("BasicNFT");
    const basicNFT = await BasicNFT.deploy();
  
    await basicNFT.deployed();

    console.log(
        `NFT contract deployed to ${basicNFT.address}`
      );
  }
  

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });