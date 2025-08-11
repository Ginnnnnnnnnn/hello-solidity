module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    let waitConfirmations
    if (network.name == "hardhat") {
        waitConfirmations = 0
    } else {
        waitConfirmations = 5
    }
    const myToken = await deploy("ReverseString", {
        from: account1,
        args: [],
        log: true,
        waitConfirmations: waitConfirmations
    })
}

module.exports.tags = ["ReverseString"]