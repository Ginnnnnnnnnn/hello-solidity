const { task } = require("hardhat/config")

task("check-nft")
    .setAction(async (taskArgs, hre) => {
        const { account1 } = await getNamedAccounts()
        const nft = await ethers.getContract("MyToken", account1)
        const totalSupply = await nft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await nft.ownerOf(tokenId)
            console.log(`tokenid = ${tokenId} owner = ${owner}`)
        }
    })

module.exports = {}