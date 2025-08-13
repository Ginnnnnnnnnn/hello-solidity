module.exports = async ({ getNamedAccounts, deployments }) => {
    const account1 = (await getNamedAccounts()).account1
    const { deploy } = deployments
    await deploy("MyNFTERC721", {
        from: account1,
        args: ["MyNFT", "MN"],
        log: true,
    })
}

module.exports.tags = ["MyNFTERC721"]