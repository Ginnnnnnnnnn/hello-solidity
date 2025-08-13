// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// 作业3：编写一个讨饭合约
// 任务目标
// 1.使用 Solidity 编写一个合约，允许用户向合约地址发送以太币。
// 2.记录每个捐赠者的地址和捐赠金额。
// 3.允许合约所有者提取所有捐赠的资金。
// 任务步骤
// 1.编写合约
//  ·创建一个名为 BeggingContract 的合约。
//  ·合约应包含以下功能：
//  ·一个 mapping 来记录每个捐赠者的捐赠金额。
//  ·一个 donate 函数，允许用户向合约发送以太币，并记录捐赠信息。
//  ·一个 withdraw 函数，允许合约所有者提取所有资金。
//  ·一个 getDonation 函数，允许查询某个地址的捐赠金额。
//  ·使用 payable 修饰符和 address.transfer 实现支付和提款。
// 2.部署合约
//  ·在 Remix IDE 中编译合约。
//  ·部署合约到 Goerli 或 Sepolia 测试网。
// 3.测试合约
//  ·使用 MetaMask 向合约发送以太币，测试 donate 功能。
//  ·调用 withdraw 函数，测试合约所有者是否可以提取资金。
//  ·调用 getDonation 函数，查询某个地址的捐赠金额。
// 任务要求
// 1.合约代码：
//  ·使用 mapping 记录捐赠者的地址和金额。
//  ·使用 payable 修饰符实现 donate 和 withdraw 函数。
//  ·使用 onlyOwner 修饰符限制 withdraw 函数只能由合约所有者调用。
// 2.测试网部署：
//  ·合约必须部署到 Goerli 或 Sepolia 测试网。
// 3.功能测试：
//  ·确保 donate、withdraw 和 getDonation 函数正常工作。
// 提交内容
// 1.合约代码：提交 Solidity 合约文件（如 BeggingContract.sol）。
// 2.合约地址：提交部署到测试网的合约地址。
// 3.测试截图：提交在 Remix 或 Etherscan 上测试合约的截图。
// 额外挑战（可选）
// 1.捐赠事件：添加 Donation 事件，记录每次捐赠的地址和金额。
// 2.捐赠排行榜：实现一个功能，显示捐赠金额最多的前 3 个地址。
// 3.时间限制：添加一个时间限制，只有在特定时间段内才能捐赠。
contract BeggingContract {
    mapping(address => uint256) private donorMap;
    address[] private donors;
    address private owner;
    // 时间限制：添加一个时间限制，只有在特定时间段内才能捐赠。
    uint256 private windowsCloseTime;

    // 捐赠事件：添加 Donation 事件，记录每次捐赠的地址和金额。
    event DonationReceived(address donor, uint256 amount);

    constructor() {
        owner = msg.sender;
        windowsCloseTime = block.timestamp + 60;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner can call this function");
        _;
    }

    modifier windowsOpen() {
        require(block.timestamp < windowsCloseTime, "windows is closed");
        _;
    }

    modifier windowsClose() {
        require(block.timestamp >= windowsCloseTime, "windows is closed");
        _;
    }

    // 一个 donate 函数，允许用户向合约发送以太币，并记录捐赠信息。
    function donate() external payable windowsOpen {
        donorMap[msg.sender] += msg.value;
        donors.push(msg.sender);
        emit DonationReceived(msg.sender, msg.value);
    }

    // 一个 withdraw 函数，允许合约所有者提取所有资金。
    function withdraw() external onlyOwner windowsClose {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner).transfer(balance);
    }

    // 一个 getDonation 函数，允许查询某个地址的捐赠金额。
    function getDonation(address addr) external view returns (uint256) {
        return donorMap[addr];
    }

    // 捐赠排行榜：实现一个功能，显示捐赠金额最多的前 3 个地址。
    function getTopDonors()
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        address[] memory topDonors = new address[](3);
        uint256[] memory topAmounts = new uint256[](3);
        // 遍历查询TOP3
        for (uint256 i = 0; i < 3; i++) {
            address maxAddres = address(0);
            uint256 maxAmount = 0;
            for (uint256 j = 0; j < donors.length; j++) {
                address donor = donors[j];
                // 如果已经在前面3个地址中，跳过
                bool isInTop = false;
                for (uint256 k = 0; k < topDonors.length; k++) {
                    if (topDonors[k] == donor) {
                        isInTop = true;
                    }
                }
                if (isInTop) {
                    continue;
                }
                // 判断是否大于上一个最大值
                uint256 amount = donorMap[donor];
                if (amount > maxAmount) {
                    maxAddres = donor;
                    maxAmount = amount;
                }
            }
            if (maxAddres != address(0)) {
                topDonors[i] = maxAddres;
                topAmounts[i] = maxAmount;
            }
        }
        return (topDonors, topAmounts);
    }
}
