const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const BasicNFT = await hre.ethers.getContractFactory("BasicNFT");
    const basicNFT = await BasicNFT.deploy();
  

    return { basicNFT, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("It should deploy the contract with token counter = 0 ", async function () {
      const { basicNFT } = await loadFixture(deployFixture);

      expect(await basicNFT.getTokenCounter()).to.equal(0);
    });

    it("Mint function should increment the token counter", async function () {
      const { basicNFT,otherAccount  } = await loadFixture(deployFixture);

      const mint = await basicNFT.connect(otherAccount).mintNft();
      await mint.wait(1)
      expect(await basicNFT.getTokenCounter()).to.equal(1);
    });
  });
});
