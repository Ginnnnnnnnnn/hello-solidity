module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    let destinationRouter
    let linkTokenAddr
    let wnftAddr
    let waitConfirmations
    if (network.name == "hardhat") {
        const ccipSimulatorDeployment = await deployments.get("CCIPLocalSimulator")
        const ccipSimulator = await ethers.getContractAt("CCIPLocalSimulator", ccipSimulatorDeployment.address)
        const ccipConfig = await ccipSimulator.configuration();
        destinationRouter = ccipConfig.destinationRouter_
        linkTokenAddr = ccipConfig.linkToken_
        waitConfirmations = 0
    } else if (network.name == "amoy") {
        destinationRouter = "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2"
        linkTokenAddr = "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904"
        waitConfirmations = 5
    } else if (network.name == "sepolia") {
        destinationRouter = "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"
        linkTokenAddr = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
        waitConfirmations = 5
    }
    const wnftDeployment = await deployments.get("WarppendMyToken")
    wnftAddr = wnftDeployment.address
    const myToken = await deploy("NFTPoolBurnAndMint", {
        from: account1,
        args: [destinationRouter, linkTokenAddr, wnftAddr],
        log: true,
        waitConfirmations: waitConfirmations
    })
}

module.exports.tags = ["destchain", "all", "NFTPoolBurnAndMint"]