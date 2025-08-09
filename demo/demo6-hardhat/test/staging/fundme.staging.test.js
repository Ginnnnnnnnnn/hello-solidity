const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

network.name == "hardhat" ? describe.skip :
    describe("test fundme contract", async function () {
        let fundMe1
        let account1
        beforeEach(async function () {
            await deployments.fixture(["all"])
            account1 = (await getNamedAccounts()).account1
            const fundMeDeployment = await deployments.get("FundMe")
            fundMe1 = await ethers.getContractAt("FundMe", fundMeDeployment.address)
        })

        it("测试 fund()成功, getFund()成功", async function () {
            // 调用 fund()
            await fundMe1.fund({ value: ethers.parseEther("0.05") })
            // 等待窗口关闭
            await new Promise(resolve => setTimeout(resolve, 130 * 1000))
            // 调用 getFund()
            const getFundTx = await fundMe1.getFund()
            const getFundReceipt = await getFundTx.wait()
            await expect(getFundReceipt)
                .to.emit(fundMe1, "GetFundEvent")
                .withArgs(ethers.parseEther("0.05"))
        })

        it("测试 fund()成功, refund()成功", async function () {
            // 调用 fund()
            await fundMe1.fund({ value: ethers.parseEther("0.01") })
            // 等待窗口关闭
            await new Promise(resolve => setTimeout(resolve, 130 * 1000))
            // 调用 getFund()
            const refundTx = await fundMe1.refund()
            const refundReceipt = await refundTx.wait()
            await expect(refundReceipt)
                .to.emit(fundMe1, "RefundEvent")
                .withArgs(account1, ethers.parseEther("0.01"))
        })

    })