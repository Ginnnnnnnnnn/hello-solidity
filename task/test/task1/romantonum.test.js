const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let romanToNumber
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["RomanToNumber"])
    romanToNumber = await ethers.getContract("RomanToNumber", account1)
})

describe("RomanToNumber合约测试", async function () {
    it("测试 toNumber()方法1", async function () {
        const newString = await romanToNumber.toNumber("III")
        assert.equal(newString, "3", "罗马数字转数字不正确")
    });
    it("测试 toNumber()方法2", async function () {
        const newString = await romanToNumber.toNumber("LVIII")
        assert.equal(newString, "58", "罗马数字转数字不正确")
    });
    it("测试 toNumber()方法3", async function () {
        const newString = await romanToNumber.toNumber("MCMXCIV")
        assert.equal(newString, "1994", "罗马数字转数字不正确")
    });
});