module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    await deploy("MyTokenERC20", {
        from: account1,
        args: ["MyToken", "MT"],
        log: true,
    })
}

module.exports.tags = ["MyTokenERC20"]