require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
require("./tasks/deployFundMe")
require("./tasks/interactFundMe")
require('hardhat-deploy')
require("hardhat-deploy-ethers");
require("@nomicfoundation/hardhat-ethers");

// 设置 hardhat 代理
const { ProxyAgent, setGlobalDispatcher } = require("undici")
const proxyAgent = new ProxyAgent("http://127.0.0.1:10809");
setGlobalDispatcher(proxyAgent);

// 读取环境变量
const SEPOLIA_URL = process.env.SEPOLIA_URL
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
      chainId: 11155111
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
    enabled: true
  }
};
