require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require("hardhat-deploy")
require("hardhat-deploy-ethers")

// 设置 hardhat 代理
const { ProxyAgent, setGlobalDispatcher } = require("undici")
const proxyAgent = new ProxyAgent("http://127.0.0.1:10809");
setGlobalDispatcher(proxyAgent);

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: [process.env.PRIVATE_KEY_1],
      chainId: 11155111
    },
  },
  namedAccounts: {
    account1: {
      default: 0
    },
    account2: {
      default: 1
    }
  },
};
