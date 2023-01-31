const pinataSDK = require('@pinata/sdk');
const path = require("path")
const fs = require("fs")
require("dotenv").config();
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);


const imagesLocation = "./images/random"
const metadataTemplate = {
    name: "",
    description:"",
    image:"",
    attributes:[
        {
            trait_type: "Cuteness",
            value: 100,
        }
    ]
}
async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)

    const files = fs.readdirSync(fullImagesPath).filter((file) => file.includes(".png"))
    let responses = []
    console.log("Uploading to IPFS")

    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        }
        try {
            await pinata
                .pinFileToIPFS(readableStreamForFile, options)
                .then((result) => {
                    responses.push(result)
                })
                .catch((err) => {
                    console.log(err)
                })
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

async function storeTokenURIMetadata(metadata){
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
    }
    try{
        const response = await pinata.pinJSONToIPFS(metadata, options)
        return response
    } catch(error){
        console.log(error)
    } 
    return null
}
module.exports = { storeImages, imagesLocation,metadataTemplate,storeTokenURIMetadata }