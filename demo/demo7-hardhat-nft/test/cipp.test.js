const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let ccipSimulator
let chainSelector
let nft
let nftPoolLockAndRelease
let wnft
let nftPoolBurnAndMint
before(async function () {
    account1 = (await getNamedAccounts()).account1
    await deployments.fixture(["all"])
    ccipSimulator = await ethers.getContract("CCIPLocalSimulator", account1)
    const ccipConfig = await ccipSimulator.configuration();
    chainSelector = ccipConfig.chainSelector_
    nft = await ethers.getContract("MyToken", account1)
    nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", account1)
    wnft = await ethers.getContract("WarppendMyToken", account1)
    nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", account1)
})

describe("跨链测试", async function () {
    it("测试 用户跨链发送NFT(burn)", async function () {
        // 铸造两个NFT
        await nft.safeMint(account1)
        await nft.safeMint(account1)
        console.log(`铸造两个NFT`)
        // 查询NFT账户
        let totalSupply = await nft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await nft.ownerOf(tokenId)
            console.log(`NFT tokenid = ${tokenId} owner = ${owner}`)
        }
        // 跨链 NFT -> WNFT
        await nft.approve(nftPoolLockAndRelease.target, 0)
        await ccipSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("10"))
        await nftPoolLockAndRelease.lockAndSendNFT(0, account1, chainSelector, nftPoolBurnAndMint.target)
        console.log(`跨链 NFT -> WNFT`)
        // 查询NFT账户
        totalSupply = await nft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await nft.ownerOf(tokenId)
            console.log(`NFT tokenid = ${tokenId} owner = ${owner}`)
        }
        // 查询WNFT账户
        totalSupply = await wnft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await wnft.ownerOf(tokenId)
            console.log(`WNFT tokenid = ${tokenId} owner = ${owner}`)
        }
        console.log(`===========================正向流程结束===========================`)
        // 跨链 WNFT -> NFT
        await wnft.approve(nftPoolBurnAndMint.target, 0)
        await ccipSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("10"))
        await nftPoolBurnAndMint.burnAndSendNFT(0, account1, chainSelector, nftPoolLockAndRelease.target)
        console.log(`跨链 WNFT -> NFT`)
        // 查询NFT账户
        totalSupply = await nft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await nft.ownerOf(tokenId)
            console.log(`NFT tokenid = ${tokenId} owner = ${owner}`)
        }
        // 查询WNFT账户
        totalSupply = await wnft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await wnft.ownerOf(tokenId)
            console.log(`WNFT tokenid = ${tokenId} owner = ${owner}`)
        }
    });

});