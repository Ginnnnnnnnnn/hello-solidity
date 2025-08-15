const { ethers, deployments } = require("hardhat")
const { expect } = require("chai")

let account1
let myNft
before(async function () {
    // 获取账户
    account1 = (await getNamedAccounts()).account1
    // 部署NFT合约
    await deployments.fixture(["MyNft"])
    myNft = await ethers.getContract("MyNft", account1)
})

describe("NftAuctionV2 合约测试", async function () {
    it("测试 合约升级", async function () {
        // 1.部署业务合约
        await deployments.fixture(["NftAuction"])
        const nftAuction = await ethers.getContract("NftAuction", account1)
        // 2.调用 createAuction 方法创建拍卖
        await myNft.safeMint(account1)
        await myNft.setApprovalForAll(nftAuction.target, true);
        await nftAuction.createAuction(
            100,
            ethers.parseEther("1"),
            myNft.target,
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
        const auction2 = await nftAuctionV2.auctions(0)
        // 对比
        await expect(hello).to.equal("hello v2")
        await expect(auction1[1]).to.equal(auction2[1])
        await expect(implAddress1).to.not.equal(implAddress2)
    })
})