const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let romanToNumber
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["MergeArray"])
    romanToNumber = await ethers.getContract("MergeArray", account1)
})

describe("MergeArray 合约测试", async function () {
    it("测试 merge()方法", async function () {
        const newArray = await romanToNumber.merge([1, 3, 5], [2, 4])
        await assert.equal(newArray.toString(), [1, 2, 3, 4, 5].toString(), "罗马数字转数字不正确")
    });
});