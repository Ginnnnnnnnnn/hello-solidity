module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    let waitConfirmations
    if (network.name == "hardhat") {
        waitConfirmations = 0
    } else {
        waitConfirmations = 5
    }
    await deploy("MyNft", {
        from: account1,
        args: ["MyNFT", "MN"],
        log: true,
        waitConfirmations: waitConfirmations
    })
}

module.exports.tags = ["MyNft"]