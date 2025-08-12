// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

// 作业 1：ERC20 代币
// 任务：参考 openzeppelin-contracts/contracts/token/ERC20/IERC20.sol实现一个简单的 ERC20 代币合约。要求：
// 1.合约包含以下标准 ERC20 功能：
// 2.balanceOf：查询账户余额。
// 3.transfer：转账。
// 4.approve 和 transferFrom：授权和代扣转账。
// 5.使用 event 记录转账和授权操作。
// 6.提供 mint 函数，允许合约所有者增发代币。
// 提示：
// ·使用 mapping 存储账户余额和授权信息。
// ·使用 event 定义 Transfer 和 Approval 事件。
// ·部署到sepolia 测试网，导入到自己的钱包
contract MyTokenERC20 is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {}

    function mint(address addr, uint256 amount) public onlyOwner {
        super._mint(addr, amount);
    }

    function balanceOf(address addr) public view override returns (uint256) {
        return super.balanceOf(addr);
    }

    function transfer(
        address addr,
        uint256 amount
    ) public override returns (bool) {
        return super.transfer(addr, amount);
    }

    // 授权 addr 可以花费 amount 数量的代币
    function approve(
        address addr,
        uint256 amount
    ) public override returns (bool) {
        return super.approve(addr, amount);
    }

    // 被授权人 从授权人 from 账户扣除 amount 数量的代币 to 账户并且扣除授信额度
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}
