const { ethers, deployments, getNamedAccounts } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
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
describe("MyNft 合约测试", async function () {
    it("测试 全流程", async function () {
        // 铸造NFT
        await myNft.safeMint(account1)
        // 查看NFT拥有者
        const owner = await myNft.ownerOf(0)
        expect(owner).to.equal(account1)
    })
})