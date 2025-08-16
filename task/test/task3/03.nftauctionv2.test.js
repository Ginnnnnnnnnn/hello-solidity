const { ethers, deployments, getNamedAccounts } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")

let account1
let account2
let myNft
let myToken
let myNftAuction1
let myNftAuction2
before(async function () {
    // 获取账户
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    // 部署NFT合约
    await deployments.fixture(["MyNft"])
    myNft = await ethers.getContract("MyNft", account1)
    // 部署NFT合约
    await deployments.fixture(["MyToken"])
    myToken = await ethers.getContract("MyToken", account1)
    // 部署NFT拍卖合约
    await deployments.fixture(["NftAuction"])
    myNftAuction1 = await ethers.getContract("NftAuction", account1)
    myNftAuction2 = await ethers.getContract("NftAuction", account2)
})
describe("NftAuction 合约测试", async function () {
    it("测试 NFT全流程", async function () {
        // 铸造NFT
        await myNft.safeMint(account1)
        await myNft.safeMint(account1)
    })
    it("测试 Token全流程", async function () {
        // 铸造NFT
        await myToken.mint(account1, ethers.parseEther("10"))
        await myToken.mint(account2, ethers.parseEther("10"))
    })
    it("测试 V1全流程", async function () {
        const tokenId = 0
        const auctionId = 0
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
        await myNftAuction1.placeBid(auctionId, {
            value: ethers.parseEther("2")
        });
        // 等待结束
        await helpers.time.increase(61)
        await helpers.mine()
        // 结束拍卖：验证token拥有者; 合约余额
        await myNftAuction1.endAuction(auctionId);
        expect(await myNft.ownerOf(tokenId)).to.equal(account1)
        expect(await ethers.provider.getBalance(myNftAuction1.target)).to.equal(ethers.parseEther("0"))
    })
    it("测试 V2全流程", async function () {
        const tokenId = 1
        const auctionId = 1
        const [signer, buyer] = await ethers.getSigners()
        // 升级合约
        await deployments.fixture(["NftAuctionV2"])
        const myNftAuctionv2 = await ethers.getContractAt("NftAuctionV2", myNftAuction1.target);
        // 验证数据
        const auction1 = await myNftAuction1.auctions(0)
        const auction2 = await myNftAuctionv2.auctions(0)
        expect(auction1[1]).to.equal(auction2[1])
        // 设置wei价
        await deployments.fixture(["MockV3Aggregator"])
        const mockV3Aggregator = await deployments.get("MockV3Aggregator")
        await myNftAuctionv2.setPriceFeed(ethers.ZeroAddress, mockV3Aggregator.address)
        await myNftAuctionv2.setPriceFeed(myToken.target, mockV3Aggregator.address)
        // 创建拍卖: 验证token拥有者
        await myNft.setApprovalForAll(myNftAuctionv2.target, true);
        await myNftAuctionv2.createAuction(
            120,
            ethers.parseEther("1"),
            myNft.target,
            tokenId
        );
        expect(await myNft.ownerOf(tokenId)).to.equal(myNftAuctionv2.target)
        // 参与拍卖
        await myToken.connect(buyer).approve(myNftAuctionv2.target, ethers.parseEther("10"))
        await myNftAuctionv2.connect(signer).placeBid(auctionId, ethers.parseEther("0"), ethers.ZeroAddress, {
            value: ethers.parseEther("2")
        });
        await myNftAuctionv2.connect(buyer).placeBid(auctionId, ethers.parseEther("10"), myToken.target, {
            value: ethers.parseEther("0")
        });
        // 等待结束
        await helpers.time.increase(121)
        await helpers.mine()
        // 结束拍卖：验证token拥有者; 合约余额
        await myNftAuctionv2.endAuction(auctionId);
        expect(await myNft.ownerOf(tokenId)).to.equal(account2)
        const balance1 = await myToken.balanceOf(account1)
        const balance2 = await myToken.balanceOf(account2)
        expect(balance1).to.equal(ethers.parseEther("20"))
        expect(balance2).to.equal(ethers.parseEther("0"))
    })
})