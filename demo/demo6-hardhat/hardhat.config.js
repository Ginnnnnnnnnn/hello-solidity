require("@nomicfoundation/hardhat-toolbox")
require("@chainlink/env-enc").config()

const SEPOLIA_URL = process.env.SEPOLIA_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

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
    apiKey: "8GRGD5H8BT1A7CIU4QZ1IHCGFA5GCMSDJG"
  },
  sourcify: {
    enabled: true, // 启用 Sourcify 验证
  },
};
