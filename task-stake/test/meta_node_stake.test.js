const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { expect } = require("chai")
const { mineUpTo } = require("@nomicfoundation/hardhat-network-helpers")

let owner, account1
let metaNodeToken, metaNodeStake
before(async function () {
    // 获取账户
    [owner, account1] = await ethers.getSigners()
    // 部署 MetaNodeToken
    // 1.默认铸造：10000000 * 1 eth 个代币
    await deployments.fixture(["MetaNodeToken"])
    metaNodeToken = await ethers.getContract("MetaNodeToken", owner)
    // 部署 MetaNodeStake
    // 1.奖励代币：MetaNodeToken
    // 2.开始区块：部署区块
    // 3.结束区块：部署区块 + 100
    // 3.每区块奖励数量：1 eth 个 MetaNodeToken 代币
    await deployments.fixture(["MetaNodeStake"])
    metaNodeStake = await ethers.getContract("MetaNodeStake", owner)
    await metaNodeStake.setMetaNode(metaNodeToken.target)
    // 铸造 MetaNodeToken 代币
    await metaNodeToken.transfer(metaNodeStake.target, ethers.parseEther("100"))
})

describe("MetaNodeToken 合约测试", async function () {
    const ethPoolId = 0
    const stakeAmount = ethers.parseEther("10")
    describe("测试 代币池", function () {
        it("测试 添加ETH池", async function () {
            await expect(await metaNodeStake.addPool(
                ethers.ZeroAddress, // ETH池
                50, // 权重
                ethers.parseEther("0.5"), // 最小质押数量
                100, // 解锁等待区块数量
                false
            )).to.emit(metaNodeStake, "AddPool")
            const pool = await metaNodeStake.pool(ethPoolId)
            expect(pool[0]).to.equal(ethers.ZeroAddress)
            expect(pool[1]).to.equal(50)
            expect(pool[5]).to.equal(ethers.parseEther("0.5"))
            expect(pool[6]).to.equal(100)
            expect(await metaNodeStake.poolLength()).to.equal(1)
            expect(await metaNodeStake.totalPoolWeight()).to.equal(50)
        })
        it("测试 更新代币池", async function () {
            await expect(await metaNodeStake.updatePool(
                ethPoolId, // ETH池
                ethers.parseEther("1"), // 最小质押数量
                10 // 解锁等待区块数量
            )).to.emit(metaNodeStake, "UpdatePoolInfo")
            const pool = await metaNodeStake.pool(ethPoolId)
            expect(pool[5]).to.equal(ethers.parseEther("1"))
            expect(pool[6]).to.equal(10)

        })
        it("测试 更新代币池权重", async function () {
            await expect(await metaNodeStake.setPoolWeight(
                ethPoolId, // ETH池
                100, // 最小质押数量
                false
            )).to.emit(metaNodeStake, "SetPoolWeight")
            expect(await metaNodeStake.totalPoolWeight()).to.equal(100)
        })
    })
    describe("测试 用户操作", function () {
        it("测试 质押ETH", async function () {
            await expect(await metaNodeStake.connect(account1).depositETH(
                {
                    value: stakeAmount
                }
            )).to
                .emit(metaNodeStake, "Deposit")
                .withArgs(account1.address, ethPoolId, stakeAmount)

            const user = await metaNodeStake.user(ethPoolId, account1.address)
            expect(user[0]).to.equal(stakeAmount)

            const pool = await metaNodeStake.pool(ethPoolId)
            expect(pool[4]).to.equal(stakeAmount)
        })
        it("测试 计算奖励代币", async function () {
            // 挖掘一些区块
            await mineUpTo(20)
            const pendingMetaNode = await metaNodeStake.pendingMetaNode(ethPoolId, account1.address)
            expect(pendingMetaNode).to.be.gt(ethers.parseEther("1"))
        })
        it("测试 解锁代币", async function () {
            await expect(await metaNodeStake.connect(account1).unstake(ethPoolId, stakeAmount)).to
                .emit(metaNodeStake, "RequestUnstake").withArgs(account1.address, ethPoolId, stakeAmount)
            const user = await metaNodeStake.user(ethPoolId, account1.address)
            expect(user[2]).to.be.gt(ethers.parseEther("1"))
        })
        it("测试 领取奖励", async function () {
            const beforeUser = await metaNodeStake.user(ethPoolId, account1.address)
            await expect(await metaNodeStake.connect(account1).claim(ethPoolId)).to
                .emit(metaNodeStake, "Claim")
                .withArgs(account1.address, ethPoolId, beforeUser[2])
            const afterUser = await metaNodeStake.user(ethPoolId, account1.address)
            expect(afterUser[2]).to.equal(0)
            const account1MetaNodeTokenBalance = await metaNodeToken.balanceOf(account1.address)
            expect(beforeUser[2]).to.equal(account1MetaNodeTokenBalance)
        })
        it("测试 提现代币", async function () {
            // 挖掘一些区块
            await mineUpTo(30)
            const beforeBalance = await ethers.provider.getBalance(account1.address);
            await expect(await metaNodeStake.connect(account1).withdraw(ethPoolId)).to
                .emit(metaNodeStake, "Withdraw")
            const afterBalance = await ethers.provider.getBalance(account1.address);
            expect(afterBalance).to.be.gt(beforeBalance)
        })
    })
})