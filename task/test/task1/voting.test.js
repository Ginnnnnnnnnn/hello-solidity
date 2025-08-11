const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

let account1
let account2
let voting
before(async function () {
    account1 = (await getNamedAccounts()).account1
    account2 = (await getNamedAccounts()).account2
    await deployments.fixture(["Voting"])
    voting = await ethers.getContract("Voting", account1)
})

describe("voting合约测试", async function () {
    it("测试 vote()查询", async function () {
        // 给两个账户投票
        await voting.vote(account1)
        await voting.vote(account2)
        let account1Votes = await voting.votingMap(account1)
        let account2Votes = await voting.votingMap(account2)
        assert.isTrue(account1Votes > 0, "account1的投票数不正确")
        assert.isTrue(account2Votes > 0, "account2的投票数不正确")
    });

    it("测试 getVotes()查询", async function () {
        // 查询投票数
        let account1Votes = await voting.getVotes(account1)
        let account2Votes = await voting.getVotes(account2)
        assert.isTrue(account1Votes > 0, "account1的投票数不正确")
        assert.isTrue(account2Votes > 0, "account2的投票数不正确")
    });

    it("测试 resetVotes()重置", async function () {
        // 充值account2投票
        await voting.resetVotes(account2)
        account2Votes = await voting.getVotes(account2)
        assert.equal(account2Votes, 0, "account2重置票数不正确")
    });
});