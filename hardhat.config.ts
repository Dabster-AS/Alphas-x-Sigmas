import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import { MerkleTree } from 'merkletreejs';
import keccak256 from 'keccak256';

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("merkle", "Generates a merkle tree from whitelist", async (taskArgs, hre) => {
  function hashToken(tokenId: string, account: string) {
    return Buffer.from(hre.ethers.utils.solidityKeccak256(
      ['uint256', 'address'],
      [tokenId, account],
    ).slice(2), 'hex');
  }
  const tokens = {
    '056665177': '0xa111C225A0aFd5aD64221B1bc1D5d817e5D3Ca15',
    '364166988': '0x8de806462823aD25056eE8104101F9367E208C14',
    '777704111': '0x801EfbcFfc2Cf572D4C30De9CEE2a0AFeBfa1Ce1',
  };

  const leaf = Object.entries(tokens).map(token => hashToken(...token));
  const merkleTree = new MerkleTree(leaf, keccak256, { sortPairs: true });
  const proof = merkleTree.getHexProof(hashToken(...Object.entries(tokens)[0]));

  console.log(leaf);
  console.log(merkleTree);
  console.log(proof)

});

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    rinkeby: {
      url: process.env.RINKEBY_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
