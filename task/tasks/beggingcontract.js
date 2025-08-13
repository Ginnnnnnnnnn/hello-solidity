const { task } = require("hardhat/config")

task("beggingcontract")
    .setAction(async (taskArgs, hre) => {
        const { account1, account2 } = await getNamedAccounts()
        console.log(`账户加载完成 ${account1} ${account2}`)
        const beggingContract1 = await ethers.getContract("BeggingContract", account1)
        const beggingContract2 = await ethers.getContract("BeggingContract", account2)
        console.log(`合约加载完成 ${beggingContract1.target} ${beggingContract2.target}`)
        // 捐赠
        // await beggingContract1.donate({ value: ethers.parseEther("0.001") })
        // await beggingContract2.donate({ value: ethers.parseEther("0.001") })
        // console.log(`捐赠完成`)
        // 查看捐赠金额
        const balance1 = await beggingContract1.getDonation(account1)
        const balance2 = await beggingContract2.getDonation(account2)
        console.log(`捐赠金额 ${ethers.formatEther(balance1)} ${ethers.formatEther(balance2)}`)
        // 提现
        // await beggingContract1.withdraw()
        // console.log(`提现完成`)
        // 查看前3名捐赠者
        const [topDonors, topAmounts] = await beggingContract1.getTopDonors()
        console.log(`前3名捐赠者 ${topDonors[0]} ${topDonors[1]} ${topDonors[2]}`)
        console.log(`前3名捐赠金额 ${ethers.formatEther(topAmounts[0])} ${ethers.formatEther(topAmounts[1])} ${ethers.formatEther(topAmounts[2])}`)
    })

module.exports = {}