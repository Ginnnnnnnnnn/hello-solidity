const { ethers, deployments, getNamedAccounts } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    let sourceChainRouter
    let linkTokenAddr
    let nftAddr
    let waitConfirmations
    if (network.name == "hardhat") {
        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address)
        const ccipConfig = await ccipSimulator.configuration();
        sourceChainRouter = ccipConfig.sourceRouter_
        linkTokenAddr = ccipConfig.linkToken_
        waitConfirmations = 0
    } else if (network.name == "amoy") {
        destinationRouter = "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2"
        linkTokenAddr = "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904"
        waitConfirmations = 5
    } else if (network.name == "sepolia") {
        sourceChainRouter = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"
        linkTokenAddr = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
        waitConfirmations = 5
    }
    const nftDeployment = await deployments.get("MyToken")
    nftAddr = nftDeployment.address
    const myToken = await deploy("NFTPoolLockAndRelease", {
        from: account1,
        args: [sourceChainRouter, linkTokenAddr, nftAddr],
        log: true,
        waitConfirmations: waitConfirmations
    })
    if (hre.network.config.chainId == 11155111) {
        await hre.run("verify:verify", {
            address: myToken.address,
            constructorArguments: [sourceChainRouter, linkTokenAddr, nftAddr],
        });
    }
}

module.exports.tags = ["sourcechain", "all", "NFTPoolLockAndRelease"]