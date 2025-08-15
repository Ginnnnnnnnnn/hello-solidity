const { deployments, upgrades, ethers } = require("hardhat")
const fs = require("fs")
const path = require("path")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { save } = deployments

    // 获取合约工厂
    const nftAuctionFactory = await ethers.getContractFactory("NftAuction")

    // 通过代理合约部署
    const nftAuctionProxy = await upgrades.deployProxy(nftAuctionFactory, [], {
        initializer: "initialize"
    })
    await nftAuctionProxy.waitForDeployment()
    const proxyAddress = await nftAuctionProxy.getAddress()
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
    const storePath = path.resolve(__dirname, "./.cache/proxyNftAuction.json")
    fs.writeFileSync(
        storePath,
        JSON.stringify({
            proxyAddress,
            implAddress,
            abi: nftAuctionFactory.interface.format("json")
        })
    )
    await save("NftAuction", {
        abi: nftAuctionFactory.interface.format("json"),
        address: proxyAddress
    })
}

module.exports.tags = ["NftAuction"]