module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    const myToken = await deploy("MyTokenERC20", {
        from: account1,
        args: ["MyToken", "MT"],
        log: true,
    })
    if (hre.network.config.chainId == 11155111) {
        await hre.run("verify:verify", {
            address: myToken.address,
            constructorArguments: ["MyToken", "MT"],
        });
    }
}

module.exports.tags = ["MyTokenERC20"]