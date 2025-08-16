const { deployments, upgrades, ethers } = require("hardhat")
const fs = require("fs")
const path = require("path")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { save } = deployments
    // 读取配置
    const storePath = path.resolve(__dirname, "./.cache/proxyNftAuction.json");
    const storeData = fs.readFileSync(storePath, "utf-8");
    const { proxyAddress, implAddress, abi } = JSON.parse(storeData);
    // 获取需要升级合约工厂
    const nftAuctionV2Factory = await ethers.getContractFactory("NftAuctionV2")
    // 升级代理合约
    const nftAuctionProxyV2 = await upgrades.upgradeProxy(proxyAddress, nftAuctionV2Factory, { call: "admin" })
    await nftAuctionProxyV2.waitForDeployment()
    const proxyAddressV2 = nftAuctionProxyV2.getAddress()
    // 部署
    await save("NftAuctionV2", {
        abi,
        address: proxyAddressV2
    })
}

module.exports.tags = ["NftAuctionV2"]