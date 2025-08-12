const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let reverseString
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["ReverseString"])
    reverseString = await ethers.getContract("ReverseString", account1)
})

describe("ReverseString合约测试", async function () {
    it("测试 reverse()方法", async function () {
        const newString = await reverseString.reverse("123456789")
        assert.equal(newString, "987654321", "反转字符串不正确")
    });
});