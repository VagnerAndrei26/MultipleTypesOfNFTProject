// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomNFT__RangeOutOfBounds();
error RandomNFT__NeedMoreEthSent();

contract RandomNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
    //when the nft is minted, it will trigger a VRF chainlink call to a random number
    //using the number you can get a random NFT
    //Pug, Shiba, St.Bernard
    //Pug super rare
    //Shiba rare
    //St.bernard common

    //users have to pay to mint NFT
    //owner can withdraw the ETH 

    //type declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }
    
    //Chainlink VRF variables
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    //VRF Helpers
    mapping(uint => address) public s_requestIdToSender;

    //NFT Variable
    uint public s_tokenCounter;
    uint internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenURIs;
    uint internal immutable i_mintFee;

    //Events
    event NftRequested(uint indexed tokenId, address requester);
    event NftMinted(Breed dogBreed, address minter);


    constructor(address vrfCoordinatorV2, uint64 subscriptionId, bytes32 gasLane, uint32 callbackGasLimit, string[3] memory dogTokenURIs, uint mintFee ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("RandomDogs", "RAD") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenURIs = dogTokenURIs;
        i_mintFee = mintFee;
    }


    function requestNft() public payable returns(uint requestId){
        if(msg.value < i_mintFee){
            revert RandomNFT__NeedMoreEthSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);

    }

    function fulfillRandomWords(uint requestId, uint[] memory randomWords) internal override {
        address nftOwner = s_requestIdToSender[requestId];
        uint newTokenId = s_tokenCounter;
        uint moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        // 0 - 99
        // 7 - PUG
        // 13 - Shiba
        //44 - ST.bernard
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        s_tokenCounter ++;
        _safeMint(nftOwner, newTokenId);
        _setTokenURI(newTokenId, s_dogTokenURIs[uint(dogBreed)]);
        emit NftMinted(dogBreed, nftOwner);
    }

    function withdraw() public onlyOwner {
        (bool s, ) = msg.sender.call{ value:address(this).balance }("");
        require(s);
    }

    function getBreedFromModdedRng(uint moddedRng) public pure returns(Breed) {
        uint cumulativeSum = 0;
        uint[3] memory chanceArray = getChanceArray();
        for(uint i=0; i<chanceArray.length; i++){
            if(moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]){
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomNFT__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns(uint[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns(uint) {
        return i_mintFee;
    }

    function getDogTokenUri(uint index) public view returns(string memory) {
        return s_dogTokenURIs[index];
    }

    function getTokenCounter() public view returns(uint) {
        return s_tokenCounter;
    }
}