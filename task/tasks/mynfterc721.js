const { task } = require("hardhat/config")

task("mynfterc721")
    .setAction(async (taskArgs, hre) => {
        const { account1, account2 } = await getNamedAccounts()
        console.log(`账户加载完成 account1: ${account1} account2: ${account2}`)
        const myNFT = await ethers.getContract("MyNFTERC721", account1)
        console.log(`合约加载完成 myNFT: ${myNFT.target}`)
        // 铸造两个NFT
        const mintTx1 = await myNFT.safeMint(account1, "ipfs://QmbtZT1Pt9eHmgBE3UkGY4uUb4Gh4zc6ypn13p2CAt4GgR")
        mintTx1.wait(10)
        const mintTx2 = await myNFT.safeMint(account2, "ipfs://QmVkBwAnKQxzvM7GGqcj5ya65f8Ljnry7tt9bNimYwfMAJ")
        mintTx2.wait(10)
        console.log(`铸造两个NFT完成`)
        // 查询NFT拥有者
        const totalSupply = await myNFT.totalSupply()
        for (let i = 1; i <= totalSupply; i++) {
            const owner = await myNFT.ownerOf(i)
            console.log(`NFT tokenId = ${i} owner = ${owner}`)
        }
    })

module.exports = {}