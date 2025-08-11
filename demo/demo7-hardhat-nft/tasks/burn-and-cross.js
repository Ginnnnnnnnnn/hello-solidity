const { task } = require("hardhat/config")
const { networkConfig } = require("../helper-hardhat-config")

task("burn-and-cross")
    .addOptionalParam("receiver")
    .addParam("tokenid")
    .setAction(async (taskArgs, hre) => {
        // 获取参数
        let chainSelector
        let receiver = taskArgs.receiver
        const tokenId = taskArgs.tokenid
        if (!chainSelector) {
            chainSelector = networkConfig[network.config.chainId].companionChainSelector
        }
        if (!receiver) {
            const nftPoolLockAndReleaseDeployment = await hre.companionNetworks["destChain"].deployments.get("NFTPoolLockAndRelease")
            receiver = nftPoolLockAndReleaseDeployment.address
        }
        console.log(`参数获取完成 chainSelector = ${chainSelector} receiver = ${receiver} tokenId = ${tokenId}`)
        // 获取账户
        const { account1 } = await getNamedAccounts()
        console.log(`账户获取完成 account1 = ${account1}`)
        // 获取合约
        const nftPoolBurnAndMint = await ethers.getContract("NFTPoolBurnAndMint", account1)
        const wnft = await ethers.getContract("WarppendMyToken", account1)
        const linkAddr = networkConfig[network.config.chainId].linkToken
        const linkToken = await ethers.getContractAt("LinkToken", linkAddr)
        console.log(`合约获取完成 nftPoolBurnAndMint = ${nftPoolBurnAndMint.target} wnft = ${wnft.target} linkToken = ${linkToken.target}`)
        // 转入token保证交易手续费
        const transferTx = await linkToken.transfer(nftPoolBurnAndMint.target, ethers.parseEther("10"))
        transferTx.wait(6)
        const balance = await linkToken.balanceOf(nftPoolBurnAndMint.target)
        console.log(`已转入CCIP交易手续费 balance = ${balance}`)
        // 授权token 0操作权限
        await wnft.approve(nftPoolBurnAndMint.target, 0)
        console.log(`NFT已授权 token = ${0}`)
        // lock and send
        const burnAndSendNFTTx = await nftPoolBurnAndMint.burnAndSendNFT(tokenId, account1, chainSelector, receiver)
        console.log(`交易已完成 hash = ${burnAndSendNFTTx.hash}`)
    })

module.exports = {}