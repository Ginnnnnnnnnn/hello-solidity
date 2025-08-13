const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

let account1
let account2
let beggingContract1
let beggingContract2
before(async function () {
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    await deployments.fixture(["BeggingContract"])
    beggingContract1 = await ethers.getContract("BeggingContract", account1)
    beggingContract2 = await ethers.getContract("BeggingContract", account2)
})

describe("BeggingContract 合约测试", async function () {
    it("测试 donate()方法 窗口开启", async function () {
        await expect(beggingContract1.donate({ value: ethers.parseEther("1") })).not.to.be.reverted
        await expect(beggingContract2.donate({ value: ethers.parseEther("2") })).not.to.be.reverted
    })
    it("测试 donate()方法 窗口关闭", async function () {
        // 等待窗口关闭
        await helpers.time.increase(70)
        await helpers.mine()
        // 调用方法
        await expect(beggingContract1.donate()).to.be.revertedWith("windows is closed")
    })
    it("测试 getDonation()方法", async function () {
        const balance1 = await beggingContract1.getDonation(account1)
        const balance2 = await beggingContract2.getDonation(account2)
        await expect(balance1).to.equal(ethers.parseEther("1"))
        await expect(balance2).to.equal(ethers.parseEther("2"))
    })
    it("测试 withdraw()方法 非owner", async function () {
        await expect(beggingContract2.withdraw()).to.be.revertedWith("only owner can call this function")
    })
    it("测试 withdraw()方法", async function () {
        await expect(beggingContract1.withdraw()).not.to.be.reverted
    })
    it("测试 getTopDonors()方法", async function () {
        const [topDonors, topAmounts] = await beggingContract1.getTopDonors();
        expect(topDonors[0]).to.equal(account2);
        expect(topDonors[1]).to.equal(account1);
        expect(topDonors[2]).to.equal("0x0000000000000000000000000000000000000000");
        expect(topAmounts[0]).to.equal(ethers.parseEther("2"));
        expect(topAmounts[1]).to.equal(ethers.parseEther("1"));
        expect(topAmounts[2]).to.equal(ethers.parseEther("0"));
    })
})