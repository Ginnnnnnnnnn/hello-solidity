module.exports = async ({ getNamedAccounts, deployments }) => {
    const owner = (await getNamedAccounts()).owner
    const { deploy } = deployments
    await deploy("MetaNodeToken", {
        from: owner,
        args: [],
        log: true,
        waitConfirmations: network.name == "hardhat" ? 0 : 5
    })
}

module.exports.tags = ["MetaNodeToken"]