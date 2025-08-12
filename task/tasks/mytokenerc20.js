const { task } = require("hardhat/config")

task("mytokenerc20")
    .setAction(async (taskArgs, hre) => {
        const { account1, account2 } = await getNamedAccounts()
        console.log(`账户加载完成 account1: ${account1} account2: ${account2}`)
        const myToken1 = await ethers.getContract("MyTokenERC20", account1)
        const myToken2 = await ethers.getContract("MyTokenERC20", account2)
        console.log(`合约加载完成 myToken1: ${myToken1.target} myToken2: ${myToken2.target}`)
        // 铸造两个账户各10个代币
        await myToken1.mint(account1, ethers.parseEther("10"))
        await myToken1.mint(account2, ethers.parseEther("10"))
        console.log(`Token铸造完成`)
        // 测试转账
        await myToken2.transfer(account1, ethers.parseEther("1"))
        console.log(`转账完成`)
        // 测试授权
        await myToken2.approve(account1, ethers.parseEther("5"))
        const transferFromTx = await myToken1.transferFrom(account2, account1, ethers.parseEther("1"))
        await transferFromTx.wait(6)
        console.log(`授权转账完成`)
        // 查询最终余额
        const balance1 = await myToken1.balanceOf(account1)
        const balance2 = await myToken1.balanceOf(account2)
        console.log(`Account1 Balance: ${balance1} MyToken`)
        console.log(`Account2 Balance: ${balance2} MyToken`)
    })

module.exports = {}