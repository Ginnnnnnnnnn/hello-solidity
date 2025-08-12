const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let binarySearch
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["BinarySearch"])
    binarySearch = await ethers.getContract("BinarySearch", account1)
})

describe("BinarySearch 合约测试", async function () {
    it("测试 binarySearch()方法", async function () {
        const index = await binarySearch.search(2, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        assert.equal(index, 1, "罗马数字转数字不正确")
    });
});