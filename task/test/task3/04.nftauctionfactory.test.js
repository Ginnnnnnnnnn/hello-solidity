const { ethers, deployments, getNamedAccounts } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")

let account1
let myNft
let nftAuctionFactory
before(async function () {
    // 获取账户
    account1 = (await getNamedAccounts()).account1
    // 部署NFT合约
    await deployments.fixture(["MyNft"])
    myNft = await ethers.getContract("MyNft", account1)
    // 部署NFT合约工厂
    await deployments.fixture(["NftAuctionFactory"])
    nftAuctionFactory = await ethers.getContract("NftAuctionFactory", account1)
})
describe("NftAuctionFactory 合约测试", async function () {
    it("测试 NFT全流程", async function () {
        // 铸造NFT
        await myNft.safeMint(account1)
        await myNft.safeMint(account1)
    })
    it("测试 全流程", async function () {
        const tokenId = 0
        const auctionId = 0
        const [signer, buyer] = await ethers.getSigners()
        // 获取拍卖
        await nftAuctionFactory.createAuction()
        await nftAuctionFactory.createAuction()
        const auctionAddress1 = await nftAuctionFactory.auctions(0)
        const auctionAddress2 = await nftAuctionFactory.auctions(1)
        console.log(auctionAddress1)
        console.log(auctionAddress2)
        const nftAuction1 = await ethers.getContractAt("NftAuction", auctionAddress1);
        const nftAuction2 = await ethers.getContractAt("NftAuction", auctionAddress2);
        console.log(nftAuction1)
        console.log(nftAuction2)
    })
})