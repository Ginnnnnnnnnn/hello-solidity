module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    await deploy("BeggingContract", {
        from: account1,
        args: [],
        log: true,
    })
}

module.exports.tags = ["BeggingContract"]