const { ethers, deployments, getNamedAccounts } = require("hardhat")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { expect } = require("chai")

let account1
let myToken
before(async function () {
    // 获取账户
    account1 = (await getNamedAccounts()).account1
    // 部署NFT合约
    await deployments.fixture(["MyToken"])
    myToken = await ethers.getContract("MyToken", account1)
})
describe("MyNft 合约测试", async function () {
    it("测试 全流程", async function () {
        // 铸造Token
        await myToken.mint(account1, ethers.parseEther("10"))
        // 查看余额
        const balance = await myToken.balanceOf(account1)
        expect(balance).to.equal(ethers.parseEther("10"))
    })
})