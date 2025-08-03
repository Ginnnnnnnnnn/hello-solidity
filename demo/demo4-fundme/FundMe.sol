// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// 集资合约
// 1.集资期间可以进行 fund 集资
// 2.投资期结束 达到目标: 拥有者可以进行提现; 未达到目标: 拥有者可以进行退款
contract FundMe {
    AggregatorV3Interface internal dataFeed;

    // 合约锁定信息
    uint256 deploymentTimestamp;
    uint256 lockTime;

    // 投资信息
    mapping(address => uint256) public funderMap;

    // 最小投资额度（USD）
    // wei    = 1
    // gwei   = 1 * 10 ** 9
    // finney = 1 * 10 ** 15
    // ether  = 1 * 10 ** 18
    uint256 MIN_VALUE = 10 * 10**18;

    // 目标金额（USD）
    uint256 constant TAGET = 100 * 10**18;

    // 合约拥有者
    address public owner;

    constructor(uint256 _lockTime) {
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        deploymentTimestamp = block.timestamp;
        lockTime = _lockTime;
        owner = msg.sender;
    }

    // 收款函数
    function fund() external payable {
        // 校验最小收款额度必须大于1ETH
        require(converETHToUSD(msg.value) >= MIN_VALUE, "fund more ETH");
        // 校验募捐最大时间
        require(
            block.timestamp <= deploymentTimestamp + lockTime,
            "window is closed"
        );
        // 记录投资者信息
        funderMap[msg.sender] += msg.value;
    }

    // 转换 ETH 到 USD
    function converETHToUSD(uint256 ethAmount) internal view returns (uint256) {
        // ETH / USD precision = 10 ** 8
        // X   / USD precision = 10 ** 18
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / (10**8);
    }

    function getChainlinkDataFeedLatestAnswer() internal view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function getFund() external windowsClose onlyOwner {
        require(
            converETHToUSD(address(this).balance) >= TAGET,
            "Target is not reached"
        );
        // transfer : 转账失败回滚
        // payable(msg.sender).transfer(address(this).balance);
        // send : 返回执行结果
        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success,"transfer failed");
        // call : 返回 value 和 执行结果
        (
            bool success, /*result*/

        ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success, "transfer failed");
    }

    function transferOwner(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function refund() external windowsClose {
        require(
            converETHToUSD(address(this).balance) <= TAGET,
            "Target is reached"
        );
        uint256 amount = funderMap[msg.sender];
        require(amount != 0, "Target is reached");
        (
            bool success, /*result*/

        ) = payable(msg.sender).call{value: funderMap[msg.sender]}("");
        require(success, "transfer failed");
        funderMap[msg.sender] = 0;
    }

    // 修改器
    modifier windowsClose() {
        require(
            block.timestamp >= deploymentTimestamp + lockTime,
            "window is not closed"
        );
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this function can only be called by owner"
        );
        _;
    }
}
