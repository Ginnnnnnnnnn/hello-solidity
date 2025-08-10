const { task } = require("hardhat/config")

task("lock-and-cross")
    .addOptionalParam("receiver")
    .addParam("tokenid")
    .setAction(async (taskArgs, hre) => {
        // 获取参数
        let chainSelector
        let receiver = taskArgs.receiver
        const tokenId = taskArgs.tokenid
        if (network.name == "hardhat") {
            chainSelector = 0
        } else if (network.name == "amoy") {
            chainSelector = "16015286601757825753"
        } else if (network.name == "sepolia") {
            chainSelector = "16281711391670634445"
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
        const linkToken = await ethers.getContractAt("LinkToken", "0x779877A7B0D9E8603169DdbD7836e478b4624789")
        console.log(`合约获取完成 nftPoolLockAndRelease = ${nftPoolLockAndRelease.target} nft = ${nft.target} linkToken = ${linkToken.target}`)
        // 转入token保证交易手续费
        const transferTx = await linkToken.transfer(nftPoolLockAndRelease.target, ethers.parseEther("5"))
        transferTx.wait(6)
        const balance = await linkToken.balanceOf(nftPoolLockAndRelease.target)
        console.log(`已转入CCIP交易手续费 balance = ${balance}`)
        // 授权token 0操作权限
        await nft.approve(nftPoolLockAndRelease.target, 0)
        console.log(`NFT已授权 token = ${0}`)
        // lock and send
        const lockAndSendNFTTx = await nftPoolLockAndRelease.lockAndSendNFT(tokenId, account1, chainSelector, receiver)
        console.log(`交易已完成 hash = ${lockAndSendNFTTx.hash}`)
    })

module.exports = {}