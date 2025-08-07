const { task } = require("hardhat/config")

task("deploy-fundme", "deploy with fundme contract")
    .setAction(async (taskArgs, hre) => {
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
    })

module.exports = {}