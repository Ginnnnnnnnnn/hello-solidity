module.exports = async ({ getNamedAccounts, deployments }) => {
    if (network.name == "hardhat") {
        const { account1 } = await getNamedAccounts()
        const { deploy } = deployments
        await deploy("MockV3Aggregator", {
            from: account1,
            args: [8, 300000000000],
            log: true
        })
    }
}

module.exports.tags = ["all", "mock"]