module.exports = async ({ getNamedAccounts, deployments }) => {
    if (network.name == "hardhat") {
        const { account1 } = await getNamedAccounts()
        const { deploy, log } = deployments
        await deploy("CCIPLocalSimulator", {
            contract: "CCIPLocalSimulator",
            from: account1,
            args: [],
            log: true
        })
    }
}

module.exports.tags = ["test", "all", "CCIPLocalSimulator"]