const { task } = require("hardhat/config")

task("interact-fundme", "interact with fundme contract")
    .addParam("addr", "fundme contract address")
    .setAction(async (taskArgs, hre) => {
        const fundMeFactory = await ethers.getContractFactory("FundMe")
        const fundMe = fundMeFactory.attach(taskArgs.addr)
        // 初始化两个账户
        const [account1, account2] = await ethers.getSigners()
        // 账户1调用fund方法
        const fundTx1 = await fundMe.fund({ value: ethers.parseEther("0.01") })
        await fundTx1.wait()
        // 查看合约余额
        const balanceOfContract1 = await ethers.provider.getBalance(fundMe.target)
        console.log(`FundMe 余额 [${balanceOfContract1}]`)
        // 账户2调用fund方法
        const fundTx2 = await fundMe.connect(account2).fund({ value: ethers.parseEther("0.01") })
        await fundTx2.wait()
        // 再次查看合约余额
        const balanceOfContract2 = await ethers.provider.getBalance(fundMe.target)
        console.log(`FundMe 余额 [${balanceOfContract2}]`)
        // 查看funderMap
        const amount1Balance = await fundMe.funderMap(account1.address)
        const amount2Balance = await fundMe.funderMap(account2.address)
        console.log(`amount1Balance [${amount1Balance}] amount2Balance [${amount2Balance}]`)
    })

module.exports = {}