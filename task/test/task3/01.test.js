const { ethers, deployments, getNamedAccounts } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")

let account1
let account2
let myNft
let myNftAuction1
let myNftAuction2
before(async function () {
    // 获取账户
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    // 部署NFT合约
    await deployments.fixture(["MyNft"])
    myNft = await ethers.getContract("MyNft", account1)
    // 部署NFT拍卖合约
    await deployments.fixture(["NftAuction"])
    myNftAuction1 = await ethers.getContract("NftAuction", account1)
    myNftAuction2 = await ethers.getContract("NftAuction", account2)
})
describe("NftAuction 合约测试", async function () {
    it("测试 全流程", async function () {
        // 铸造3个NFT
        const token = 1
        await myNft.safeMint(account1)
        // 给拍卖合约授权
        await myNft.setApprovalForAll(myNftAuction1.target, true);
        // 创建拍卖
        await myNftAuction1.createAuction(
            60,
            ethers.parseEther("0.01"),
            myNft.target,
            token
        );
        // 参与拍卖
        await myNftAuction2.placeBid(0, {
            value: ethers.parseEther("0.02")
        });
        // 等待结束
        await helpers.time.increase(61)
        await helpers.mine()
        // 结束拍卖
        await myNftAuction1.endAuction(0)
        // 验证拍卖结果
        const auctionResult = await myNftAuction1.auctions(0)
        expect(auctionResult[4]).to.equal(true)
        const owner = await myNft.ownerOf(token)
        expect(owner).to.equal(account2)
        const balance = await ethers.provider.getBalance(myNftAuction1.target);
        expect(balance).to.equal(ethers.parseEther("0"))
    })

})