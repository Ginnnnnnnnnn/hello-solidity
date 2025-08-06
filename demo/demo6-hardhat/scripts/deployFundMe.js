const { ethers } = require("hardhat")

async function main() {
    // 部署合约
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = await fundMeFactory.deploy(10)
    await fundMe.waitForDeployment()
    console.log(`合约部署完成 ${fundMe.target}`)
    // 等待区块
    // await fundMe.deploymentTransaction.wait(5);
    // 验证合约
    await hre.run("verify:verify", {
        address: fundMe.target,
        constructorArguments: [10],
    });
    console.log(`合约验证完成 ${fundMe.target}`)
}

main()
    .then()
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })