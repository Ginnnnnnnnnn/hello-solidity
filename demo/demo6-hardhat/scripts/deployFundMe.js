const { ethers } = require("hardhat")

async function main() {
    // 部署合约
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = await fundMeFactory.deploy(300)
    await fundMe.waitForDeployment()
    console.log(`合约部署完成 ${fundMe.target}`)
    // 验证合约
    if (hre.network.config.chainId == 11155111) {
        await fundMe.deploymentTransaction().wait(5)
        await hre.run("verify:verify", {
            address: fundMe.target,
            constructorArguments: [300],
        });
        console.log(`合约验证完成 ${fundMe.target}`)
    }
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
}

main()
    .then()
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })