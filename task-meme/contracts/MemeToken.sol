// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Meme 代币
// 1.合约开发
// - 代币税功能：实现交易税机制，对每笔代币交易征收一定比例的税费，并将税费分配给特定的地址或用于特定的用途。
// - 流动性池集成：设计并实现与流动性池的交互功能，支持用户向流动性池添加和移除流动性。
// - 交易限制功能：设置合理的交易限制，如单笔交易最大额度、每日交易次数限制等，防止恶意操纵市场。
// 2.代码注释与文档撰写
// - 在合约代码中添加详细的注释，解释每个函数和变量的作用及实现逻辑。撰写一份操作指南，说明如何部署和使用该代币合约，包括如何进行代币交易、添加和移除流动性等操作。
contract MemeToken is ERC20, Ownable {
    //============ 状态变量 ============

    uint256 public memeBalance;
    uint256 public ethBalance;

    // Token 最大数量
    uint256 public constant TOKEN_MAX_NUMBER = 1_0000_0000;
    // Token 价格,1 ETH
    uint256 public tokenBasePrice = 1 * 10 ** 18;

    //============ 构造方法 ============

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {
        // 初始化 Token
        _mint(msg.sender, TOKEN_MAX_NUMBER);
    }

    //============ 公开方法 ============

    // 转账
    function transfer(
        address to,
        uint256 value
    ) public override returns (bool) {
        return super.transfer(to, value);
    }

    // 添加流动性
    function addLiquidity(uint256 tokenNumber) public payable {
        // 计算需要支付多少ETH
        uint256 ethAmount = tokenNumber * tokenBasePrice;
        require(msg.value >= ethAmount, "please pay more eth");
        require(msg.value <= ethAmount, "eth pay excessive");
        // 更新 token 价位

        // 转账 Token
        _transfer(address(this), msg.sender, tokenNumber);
    }

    // 移除流动性
    function removeLiquidity(uint256 ethNumber) public {
        //
    }
}
