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

describe("跨链测试-lock and mint", async function () {
  it("测试 向用户铸造1个NFT", async function () {
    await nft.safeMint(account1)
    const owner = await nft.ownerOf(0)
    await expect(owner)
      .to.equal(account1)
  });

  it("测试 用户跨链发送NFT(lock)", async function () {
    await nft.approve(nftPoolLockAndRelease.target, 0)
    await ccipSimulator.requestLinkFromFaucet(nftPoolLockAndRelease, ethers.parseEther("10"))
    await nftPoolLockAndRelease.lockAndSendNFT(0, account1, chainSelector, nftPoolBurnAndMint.target)
    const owner = await nft.ownerOf(0)
    await expect(owner)
      .to.equal(nftPoolLockAndRelease)
  });

  it("测试 用户跨链接收NFT(mint)", async function () {
    const owner = await wnft.ownerOf(0)
    await expect(owner)
      .to.equal(account1)
  });

});

describe("跨链测试-burn and unlock", async function () {
  it("测试 用户跨链发送NFT(burn)", async function () {
    await wnft.approve(nftPoolBurnAndMint.target, 0)
    await ccipSimulator.requestLinkFromFaucet(nftPoolBurnAndMint, ethers.parseEther("10"))
    await nftPoolBurnAndMint.burnAndSendNFT(0, account1, chainSelector, nftPoolLockAndRelease.target)
    const totalSupply = await wnft.totalSupply()
    await expect(totalSupply)
      .to.equal(0)
  });

  it("测试 用户跨链接收NFT(unlock)", async function () {
    const owner = await nft.ownerOf(0)
    await expect(owner)
      .to.equal(account1)
  });

});