const { ethers, deployments } = require("hardhat")
const { expect } = require("chai")

describe("NftAuctionV2 合约测试", async function () {
    it("测试 合约升级", async function () {
        const { account1 } = await getNamedAccounts()
        // 1.部署业务合约
        await deployments.fixture(["NftAuction"])
        const nftAuction = await ethers.getContract("NftAuction", account1)
        // 2.调用 createAuction 方法创建拍卖
        await nftAuction.createAuction(
            100 * 1000,
            ethers.parseEther("1"),
            ethers.ZeroAddress,
            1
        )
        const auction1 = await nftAuction.auctions(0)
        const implAddress1 = await upgrades.erc1967.getImplementationAddress(nftAuction.target)
        // 3.升级合约
        await deployments.fixture(["NftAuctionV2"])
        const implAddress2 = await upgrades.erc1967.getImplementationAddress(nftAuction.target)
        // 4.调用升级后的合约方法
        const nftAuctionV2 = await ethers.getContractAt("NftAuctionV2", nftAuction.target);
        const hello = await nftAuctionV2.testHello()
        // 5.读取合约的 auction[0]
        const auction2 = await nftAuction.auctions(0)
        // 对比
        await expect(hello).to.equal("hello v2")
        await expect(auction1.startTime).to.equal(auction2.startTime)
        await expect(implAddress1).to.not.equal(implAddress2)
    })
})