const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let numberToRoman
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["NumberToRoman"])
    numberToRoman = await ethers.getContract("NumberToRoman", account1)
})

describe("NumberToRoman合约测试", async function () {
    it("测试 toRoman()方法1", async function () {
        const newString = await numberToRoman.toRoman(3749)
        assert.equal(newString, "MMMDCCXLIX", "数字转罗马数字不正确")
    });
    it("测试 toRoman()方法2", async function () {
        const newString = await numberToRoman.toRoman(58)
        assert.equal(newString, "LVIII", "数字转罗马数字不正确")
    });
    it("测试 toRoman()方法3", async function () {
        const newString = await numberToRoman.toRoman(1994)
        assert.equal(newString, "MCMXCIV", "数字转罗马数字不正确")
    });
});