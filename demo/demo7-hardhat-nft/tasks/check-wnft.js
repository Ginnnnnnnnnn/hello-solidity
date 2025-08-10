const { task } = require("hardhat/config")

task("check-wnft")
    .setAction(async (taskArgs, hre) => {
        const { account1 } = await getNamedAccounts()
        const wnft = await ethers.getContract("WarppendMyToken", account1)
        const totalSupply = await wnft.totalSupply()
        for (let tokenId = 0; tokenId < totalSupply; tokenId++) {
            const owner = await wnft.ownerOf(tokenId)
            console.log(`tokenid = ${tokenId} owner = ${owner}`)
        }
    })

module.exports = {}