module.exports = async ({ getNamedAccounts, deployments }) => {
    const { save } = deployments
    // 获取MetaNodeToken
    const metaNodeToken = await ethers.getContract("MetaNodeToken");
    // 部署StakeContract（可升级）
    const stakeContractFactory = await ethers.getContractFactory("MetaNodeStake");
    const stakeContract = await upgrades.deployProxy(
        stakeContractFactory,
        [
            await metaNodeToken.getAddress(),
            0,
            0,
            ethers.parseEther("1")
        ],
        { initializer: "initialize" }
    );
    await stakeContract.waitForDeployment()
    const proxyAddress = await stakeContract.getAddress()
    const implAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress)
    console.log(`deploying "MetaNodeStake" proxyAddress = ${proxyAddress} implAddress = ${implAddress}`)
    // 保存部署信息
    await save("MetaNodeStake", {
        abi: stakeContractFactory.interface.format("json"),
        address: proxyAddress
    })
}

module.exports.tags = ["MetaNodeStake"]
module.exports.dependencies = ['MetaNodeToken']