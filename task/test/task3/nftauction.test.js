const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

let account1
let account2
let nft
before(async function () {
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    await deployments.fixture(["NftAuction"])
    nft = await ethers.getContract("NftAuction", account1)
})
describe("NftAuction 合约测试", async function () {
    it("测试 createAuction()方法", async function () {
        await nft.createAuction(
            100 * 1000,
            ethers.parseEther("1"),
            ethers.ZeroAddress,
            1
        )
        const auction = await nft.auctions(0)
        console.log(auction)
    })

})