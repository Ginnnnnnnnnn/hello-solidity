const { ethers } = require("hardhat")

async function main() {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = await fundMeFactory.deploy(10)
    await fundMe.waitForDeployment()
    console.log(`合约部署完成 ${fundMe.target}`)
}

main()
    .then()
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })