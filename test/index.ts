import { expect } from "chai";
import { ethers, waffle } from "hardhat";
const provider = waffle.provider;

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { AlphasSigmas, AlphasSigmas__factory, AxSClub, AxSClub__factory } from "../typechain"

import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

function hashToken(tokenId: string, account: string) {
  return Buffer.from(ethers.utils.solidityKeccak256(
    ['uint256', 'address'],
    [tokenId, account],
  ).slice(2), 'hex');
}
const tokens = {
  '0': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  '1': '0x8de806462823aD25056eE8104101F9367E208C14',
  '2': '0x801EfbcFfc2Cf572D4C30De9CEE2a0AFeBfa1Ce1',
};

const leaf = Object.entries(tokens).map(token => hashToken(...token));
const merkleTree = new MerkleTree(leaf, keccak256, { sortPairs: true });
const proof = merkleTree.getHexProof(hashToken(...Object.entries(tokens)[0]));

describe("", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];


  let Axs: AxSClub__factory;
  let axs: AxSClub;
  let AlphasSigmas: AlphasSigmas__factory;
  let alphasSigmas: AlphasSigmas;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    Axs = await ethers.getContractFactory("AxSClub");
    axs = await Axs.deploy();

    AlphasSigmas = await ethers.getContractFactory("AlphasSigmas");
    alphasSigmas = await AlphasSigmas.deploy(axs.address);

    await Promise.all([
      axs.deployed(),
      alphasSigmas.deployed()
    ])
    axs.setWhitelistMerkleRoot(merkleTree.getHexRoot())
  })
  describe("AxSClub", function () {
    it("should be able to mint free if owner", async function () {
      await axs.safeMint(owner.address);
      let bal = (await axs.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(1);
    });
    it("should be not able to mint with incorrect amount ether sent", async function () {
      await expect(axs.whitelistMint(0, proof, { value: ethers.utils.parseEther("0.04") })).to.be.revertedWith(
        "not correct amount"
      );
      await expect(axs.whitelistMint(0, proof, { value: ethers.utils.parseEther("0.06") })).to.be.revertedWith(
        "not correct amount"
      );
    });
    it("should be not able to mint when not on whitelist", async function () {
      await expect(axs.connect(addr1).whitelistMint(0, proof, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith(
        "address not owning number"
      );
    });
    it("should be able to mint when on whitelist, but only one", async function () {
      await axs.whitelistMint(0, proof, { value: ethers.utils.parseEther("0.05") })
      let bal = (await axs.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(1);
      await expect(axs.whitelistMint(0, proof, { value: ethers.utils.parseEther("0.05") })).to.be.revertedWith(
        "address already minted NFT"
      );
    });
  });

  describe("AlphasSigmas", function () {
    it("should have correct Club NFT address", async function () {
      const alphasSigmasAddress = await alphasSigmas.clubNFTAddress()
      expect(alphasSigmasAddress).to.equal(axs.address);
    });
    it("should not be able to mint without club NFT", async function () {
      await expect(alphasSigmas.clubPassMintFemle()).to.be.revertedWith(
        "address not eligible"
      );
    });
    it("should be able to mint one of each sex for free with club nft", async function () {
      await axs.safeMint(owner.address);
      let bal = (await axs.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(1);

      await alphasSigmas.clubPassMintFemle();
      bal = (await alphasSigmas.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(1)
      await expect(alphasSigmas.clubPassMintFemle()).to.be.revertedWith(
        "address not eligible"
      );

      await alphasSigmas.clubPassMintMale();
      bal = (await alphasSigmas.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(2)
      await expect(alphasSigmas.clubPassMintMale()).to.be.revertedWith(
        "address not eligible"
      );
    });
    it("should not be able to mint with wrong ether amount", async function () {
      await expect(alphasSigmas.publicFemaleMint({ value: ethers.utils.parseEther("0.45") })).to.be.revertedWith(
        "not correct amount"
      );
      await expect(alphasSigmas.publicFemaleMint({ value: ethers.utils.parseEther("0.55") })).to.be.revertedWith(
        "not correct amount"
      );
      await expect(alphasSigmas.publicMaleMint({ value: ethers.utils.parseEther("0.45") })).to.be.revertedWith(
        "not correct amount"
      );
      await expect(alphasSigmas.publicMaleMint({ value: ethers.utils.parseEther("0.55") })).to.be.revertedWith(
        "not correct amount"
      );
    });
    it("should be able to perform a public mint", async function() {
      await alphasSigmas.publicFemaleMint({ value: ethers.utils.parseEther("0.5") });
      let bal = (await alphasSigmas.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(1)

      await alphasSigmas.publicMaleMint({ value: ethers.utils.parseEther("0.5") });
      bal = (await alphasSigmas.balanceOf(owner.address)).toNumber();
      expect(bal).to.equal(2)
    });

    // TODO several stages for alphassigmas mint
    // TODO payout from the contract 
  });
})

