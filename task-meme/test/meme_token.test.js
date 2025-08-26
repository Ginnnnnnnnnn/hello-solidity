const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

// 部署合约
let account1
let memeToken
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["MemeToken"])
    memeToken = await ethers.getContract("MemeToken", account1)
})

describe("MemeToken 合约测试", async function () {
    it("测试 初始化 Token", async function () {
        var totalSupply = await memeToken.totalSupply();
        assert.equal(totalSupply, 100000000, "初始化 Token 数量错误")
    });
    it("测试 买入 Token", async function () {
        var totalSupply = await memeToken.totalSupply();
        assert.equal(totalSupply, 100000000, "初始化 Token 数量错误")
    });
});