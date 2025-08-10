const { task } = require("hardhat/config")

task("mint-nft")
    .setAction(async (taskArgs, hre) => {
        const { account1 } = await getNamedAccounts()
        const nft = await ethers.getContract("MyToken", account1)
        const miniTx = await nft.safeMint(account1)
        miniTx.wait(6)
    })

module.exports = {}