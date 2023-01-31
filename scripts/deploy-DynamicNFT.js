const hre = require("hardhat");
const fs = require("fs")


async function main() {

    const priceFeedAddress = "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    const lowSVG = await fs.readFileSync("./images/dynamicNFT/frown.svg", {encoding:"utf8"})
    const highSVF = await fs.readFileSync("./images/dynamicNFT/happy.svg", {encoding:"utf8"})

    const DynamicSvgNft = await hre.ethers.getContractFactory("DynamicSvgNft");
    const dynamicSvgNft = await DynamicSvgNft.deploy(priceFeedAddress,lowSVG,highSVF);
  
    await dynamicSvgNft.deployed();
  
  
    console.log(
      `NFT contract deployed to ${dynamicSvgNft.address}`
    );
  }
  

  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });