const { task } = require("hardhat/config")
const { networkConfig } = require("../helper-hardhat-config")

task("lock-link")
    .addParam("tokenid")
    .addOptionalParam("chainselector")
    .addOptionalParam("receiver")
    .setAction(async (taskArgs, hre) => {
        // 获取参数
        let chainSelector = taskArgs.chainselector
        let receiver = taskArgs.receiver
        const tokenId = taskArgs.tokenid
        if (!chainSelector) {
            chainSelector = networkConfig[network.config.chainId].companionChainSelector
        }
        if (!receiver) {
            const nftPoolBurnAndMintDeployment = await hre.companionNetworks["destChain"].deployments.get("NFTPoolBurnAndMint")
            receiver = nftPoolBurnAndMintDeployment.address
        }
        console.log(`参数获取完成 chainSelector = ${chainSelector} receiver = ${receiver} tokenId = ${tokenId}`)
        // 获取账户
        const { account1 } = await getNamedAccounts()
        console.log(`账户获取完成 account1 = ${account1}`)
        // 获取合约
        const nftPoolLockAndRelease = await ethers.getContract("NFTPoolLockAndRelease", account1)
        const nft = await ethers.getContract("MyToken", account1)
        const linkAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkAddr)
        console.log(`合约获取完成 nftPoolLockAndRelease = ${nftPoolLockAndRelease.target} nft = ${nft.target} linkToken = ${linkToken.target}`)
        // 转入token保证交易手续费
        const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("2"))
        await transferTx.wait(6)
        const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        console.log(`已转入CCIP交易手续费 balance = ${balance}`)
    })

module.exports = {}