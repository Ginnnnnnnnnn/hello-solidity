module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    await deploy("MemeToken", {
        from: account1,
        args: ["MemeToken", "MT"],
        log: true,
        waitConfirmations: network.name == "hardhat" ? 0 : 5
    })
}

module.exports.tags = ["MemeToken"]