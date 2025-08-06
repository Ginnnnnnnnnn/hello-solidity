require("@nomicfoundation/hardhat-toolbox")
require("@chainlink/env-enc").config()
const { ProxyAgent, setGlobalDispatcher } = require("undici");

// 设置 hardhat 代理
const proxyAgent = new ProxyAgent("http://127.0.0.1:10809");
setGlobalDispatcher(proxyAgent);

// 读取环境变量
const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.30",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_KEY
    }
  }
};
