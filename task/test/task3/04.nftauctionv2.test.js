const { ethers, deployments, getNamedAccounts } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")

let account1
let account2
let myNft
let myNftAuction1
let myNftAuction2
let myNftAuctionv21
let myNftAuctionv22
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
    // 部署NFT拍卖合约V2
    await deployments.fixture(["NftAuctionV2"])
    myNftAuctionv21 = await ethers.getContract("NftAuctionV2", account1)
    myNftAuctionv22 = await ethers.getContract("NftAuctionV2", account2)
})
describe("NftAuction 合约测试", async function () {
    it("测试 V1全流程", async function () {
        const tokenId = 0
        const auctionId = 0
        // 铸造NFT
        await myNft.safeMint(account1)
        // 授权NFT
        await myNft.setApprovalForAll(myNftAuction1.target, true);
        // 创建拍卖: 验证token拥有者
        await myNftAuction1.createAuction(
            60,
            ethers.parseEther("1"),
            myNft.target,
            tokenId
        );
        expect(await myNft.ownerOf(tokenId)).to.equal(myNftAuction1.target)
        // 参与拍卖
        await myNftAuction2.placeBid(auctionId, {
            value: ethers.parseEther("2")
        });
        // 等待结束
        await helpers.time.increase(61)
        await helpers.mine()
        // 结束拍卖：验证token拥有者; 合约余额
        await myNftAuction1.endAuction(auctionId);
        expect(await myNft.ownerOf(tokenId)).to.equal(account2)
        expect(await ethers.provider.getBalance(myNftAuction1.target)).to.equal(ethers.parseEther("0"))
    })
    it("测试 V2全流程", async function () {
       
    })
})