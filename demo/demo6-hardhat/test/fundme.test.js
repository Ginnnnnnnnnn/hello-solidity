const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

network.name != "hardhat" ? describe.skip :
  describe("test fundme contract", async function () {
    let fundMe1
    let fundMe2
    let account1
    let account2
    let mockV3Aggregator
    beforeEach(async function () {
      await deployments.fixture(["all"])
      account1 = (await getNamedAccounts()).account1
      account2 = (await getNamedAccounts()).account2
      const fundMeDeployment = await deployments.get("FundMe")
      mockV3Aggregator = await deployments.get("MockV3Aggregator")
      fundMe1 = await ethers.getContractAt("FundMe", fundMeDeployment.address)
      fundMe2 = await ethers.getContract("FundMe", account2)
    })

    it("测试 owner 是否是 msg.sender", async function () {
      await fundMe1.waitForDeployment()
      assert.equal((await fundMe1.owner()), account1)
    })

    it("测试 dataFeed 是否正确", async function () {
      await fundMe1.waitForDeployment()
      assert.equal((await fundMe1.dataFeed()), mockV3Aggregator.address)
    })

    it("测试 窗口关闭, fund()调用, 失败", async function () {
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 fund()
      await expect(fundMe1.fund({ value: ethers.parseEther("0.03") }))
        .to.be.revertedWith("window is closed")
    })

    it("测试 窗口开启, 值小于最小值, fund()调用, 失败", async function () {
      // 调用 fund()
      await expect(fundMe1.fund({ value: ethers.parseEther("0.003") }))
        .to.be.revertedWith("fund more ETH")
    })

    it("测试 窗口开启, 值大于最小值, fund()调用, 成功", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("0.03") })
      // 查询余额
      const balance = await fundMe1.funderMap(account1)
      // 对比结果
      await expect(balance).to.equal(ethers.parseEther("0.03"))
    })

    it("测试 窗口关闭, 目标达成, 非onwer, getFund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("1") })
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 getFund()
      await expect(fundMe2.getFund())
        .to.be.revertedWith("this function can only be called by owner")
    })

    it("测试 窗口开启, 目标达成, getFund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("1") })
      // 调用 getFund()
      await expect(fundMe1.getFund())
        .to.be.revertedWith("window is not closed")
    })

    it("测试 窗口关闭, 目标未达成, getFund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("0.01") })
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 getFund()
      await expect(fundMe1.getFund())
        .to.be.revertedWith("Target is not reached")
    })

    it("测试 窗口关闭, 目标达成, getFund()调用, 成功", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("1") })
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 getFund()
      await expect(fundMe1.getFund())
        .to.emit(fundMe1, "GetFundEvent")
        .withArgs(ethers.parseEther("1"))
    })

    it("测试 窗口开启, 目标未达成, refund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("0.01") })
      // 调用 getFund()
      await expect(fundMe1.refund())
        .to.be.revertedWith("window is not closed")
    })

    it("测试 窗口关闭, 目标达成, refund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("1") })
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 getFund()
      await expect(fundMe1.refund())
        .to.be.revertedWith("Target is reached")
    })

    it("测试 窗口关闭, 目标未达成, 无余额, refund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("0.01") })
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 getFund()
      await expect(fundMe2.refund())
        .to.be.revertedWith("there is no fund for you")
    })

    it("测试 窗口关闭, 目标达成, refund()调用, 失败", async function () {
      // 调用 fund()
      await fundMe1.fund({ value: ethers.parseEther("0.01") })
      // 等待窗口关闭
      await helpers.time.increase(130)
      await helpers.mine()
      // 调用 getFund()
      await expect(fundMe1.refund())
        .to.emit(fundMe1, "RefundEvent")
        .withArgs(account1, ethers.parseEther("0.01"))
    })

  })