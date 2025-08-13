const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")

let account1
let account2
let myNFT
before(async function () {
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    await deployments.fixture(["MyNFTERC721"])
    myNFT = await ethers.getContract("MyNFTERC721", account1)
})

describe("MyNFTERC721 合约测试", async function () {
    it("测试 safeMint()方法", async function () {
        await expect(myNFT.safeMint(account1, "ipfs://QmbtZT1Pt9eHmgBE3UkGY4uUb4Gh4zc6ypn13p2CAt4GgR")).not.to.be.reverted
        await expect(myNFT.safeMint(account2, "ipfs://QmVkBwAnKQxzvM7GGqcj5ya65f8Ljnry7tt9bNimYwfMAJ")).not.to.be.reverted
    });
    it("测试 ownerOf()方法", async function () {
        const owner0 = await myNFT.ownerOf(1)
        await expect(owner0).to.equal(account1);
        const owner1 = await myNFT.ownerOf(2)
        await expect(owner1).to.equal(account2);
    });
});