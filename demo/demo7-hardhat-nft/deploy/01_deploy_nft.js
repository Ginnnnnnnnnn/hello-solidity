module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    let waitConfirmations
    if (network.name == "hardhat") {
        waitConfirmations = 0
    } else {
        waitConfirmations = 5
    }
    const myToken = await deploy("MyToken", {
        from: account1,
        args: ["MyToken", "MT"],
        log: true,
        waitConfirmations: waitConfirmations
    })
}

module.exports.tags = ["sourcechain", "all", "MyToken"]