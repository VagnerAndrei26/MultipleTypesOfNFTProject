// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { storeImages,imagesLocation,metadataTemplate,storeTokenURIMetadata } = require("./uploadToPinata")

let tokenUris = [
  'ipfs://QmeHphTSoP2dHpbB88JhsM5sYHWkTQgvZvd7PPTgWBuHdJ',
  'ipfs://Qmai7GiUf73SNX5KEj7EjZKgrZVp2xMyXthhq266ic3VkF',
  'ipfs://QmXozR3cu6XVK1hs99pncx8YYd6oRVB17a9UxsD7U46w6g'
]

async function main() {

  const vrfCoordinatorV2 = "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D"
  const gasLane = "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15"
  const subscriptionId = "7608"
  const callbackGasLimit = "500000"
  const mintFee = "10000000000000000"



  const RandomNFT = await hre.ethers.getContractFactory("RandomNFT");
  const randomNFT = await RandomNFT.deploy(vrfCoordinatorV2,subscriptionId,gasLane,callbackGasLimit, tokenUris, mintFee);

  await randomNFT.deployed();

  console.log(`RandomNft contract deployed to ${randomNFT.address}`)
}

async function handleTokenURI() {
  tokenUris = []
  const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
  for(imageUploadResponseIndex in imageUploadResponses){
    //create metadata
    //upload the metadata
    let tokenURIMetadata = { ...metadataTemplate }
    tokenURIMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
    tokenURIMetadata.description = `A cute ${tokenURIMetadata.name}!`
    tokenURIMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
    console.log(`Uploading ${tokenURIMetadata.name}...`)
    //store the json to pinata
    const metadataUploadResponse = await storeTokenURIMetadata(tokenURIMetadata)
    tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
  }
  console.log("Token URIs Uploaded! They are:")
  console.log(tokenUris);
  return tokenUris
}

// handleTokenURI().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// })

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
