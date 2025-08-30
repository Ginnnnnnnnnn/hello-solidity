require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@openzeppelin/hardhat-upgrades");
require('hardhat-deploy')
require("hardhat-deploy-ethers")

module.exports = {
  solidity: {
    version: "0.8.22",
  },
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2]
    },
  },
  namedAccounts: {
    owner: {
      default: 0
    },
    account1: {
      default: 1
    }
  },
  gasReporter: {
    enabled: false
  }
};
