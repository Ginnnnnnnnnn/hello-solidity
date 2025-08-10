const { task } = require("hardhat/config")

task("mint-wnft")
    .setAction(async (taskArgs, hre) => {
        const { account1 } = await getNamedAccounts()
        const wnft = await ethers.getContract("WarppendMyToken", account1)
        const miniTx = await wnft.safeMint(account1)
        miniTx.wait(6)
    })

module.exports = {}