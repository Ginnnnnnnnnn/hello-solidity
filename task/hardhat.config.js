require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require('hardhat-deploy')
require("hardhat-deploy-ethers");

// 读取环境变量
const SEPOLIA_URL = process.env.SEPOLIA_URL
const AMOY_URL = process.env.AMOY_URL
const PRIVATE_KEY_1 = process.env.PRIVATE_KEY_1
const PRIVATE_KEY_2 = process.env.PRIVATE_KEY_2
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.30",
  mocha: {
    timeout: 6000000
  },
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY_1, PRIVATE_KEY_2],
      chainId: 11155111,
      companionNetworks: {
        destChain: "amoy"
      }
    },
    amoy: {
      url: AMOY_URL,
      accounts: [PRIVATE_KEY_1, PRIVATE_KEY_2],
      chainId: 80002,
      companionNetworks: {
        destChain: "sepolia"
      }
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_KEY
    }
  },
  namedAccounts: {
    account1: {
      default: 0
    },
    account2: {
      default: 1
    }
  },
  gasReporter: {
    enabled: false
  }
};
