const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

let account1
let account2
let myToken1
let myToken2
before(async function () {
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    // await deployments.fixture(["MyTokenERC20"])
    myToken1 = await ethers.getContract("MyTokenERC20", account1)
    myToken2 = await ethers.getContract("MyTokenERC20", account2)
})

describe("MyTokenERC20 合约测试", async function () {
    it("测试 mint()方法 非owner调用", async function () {
        await expect(myToken2.mint(account2, ethers.parseEther("10"))).to.be.reverted
    });
    it("测试 mint()方法", async function () {
        await expect(myToken1.mint(account1, ethers.parseEther("10"))).not.to.be.reverted
        await expect(myToken1.mint(account2, ethers.parseEther("10"))).not.to.be.reverted
    });
    it("测试 balanceOf()方法", async function () {
        const balance1 = await myToken1.balanceOf(account1)
        const balance2 = await myToken1.balanceOf(account2)
        expect(balance1).to.equal(ethers.parseEther("10"))
        expect(balance2).to.equal(ethers.parseEther("10"))
    });
    it("测试 transfer()方法", async function () {
        await expect(myToken2.transfer(account1, ethers.parseEther("1"))).not.to.be.reverted
        const balance1 = await myToken1.balanceOf(account1)
        const balance2 = await myToken1.balanceOf(account2)
        expect(balance1).to.equal(ethers.parseEther("11"))
        expect(balance2).to.equal(ethers.parseEther("9"))
    });
    it("测试 approve()、transferFrom()方法 未授权", async function () {
        await expect(myToken1.transferFrom(account2, account1, ethers.parseEther("1"))).to.be.revertedWithCustomError(myToken1, "ERC20InsufficientAllowance")
    });
    it("测试 approve()、transferFrom()方法", async function () {
        myToken2.approve(account1, ethers.parseEther("5"))
        await expect(myToken1.transferFrom(account2, account1, ethers.parseEther("1"))).not.to.be.reverted
    });
    it("测试 检查最终结果", async function () {
        const balance1 = await myToken1.balanceOf(account1)
        const balance2 = await myToken1.balanceOf(account2)
        expect(balance1).to.equal(ethers.parseEther("12"))
        expect(balance2).to.equal(ethers.parseEther("8"))
    });
});