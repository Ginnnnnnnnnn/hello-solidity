module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    let mockDataFeedAddr
    let waitConfirmations
    if (network.name == "hardhat") {
        const mockDataFeed = await deployments.get("MockV3Aggregator")
        mockDataFeedAddr = mockDataFeed.address
        waitConfirmations = 0
    } else {
        mockDataFeedAddr = "0x694AA1769357215DE4FAC081bf1f309aDC325306"
        waitConfirmations = 5
    }
    const fundMe = await deploy("FundMe", {
        from: account1,
        args: [120, mockDataFeedAddr],
        log: true,
        waitConfirmations: waitConfirmations
    })
    if (hre.network.config.chainId == 11155111) {
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [300, mockDataFeedAddr],
        });
    }
}

module.exports.tags = ["all", "fundme"]