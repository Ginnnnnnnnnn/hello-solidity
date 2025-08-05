// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {FundMe} from "./FundMe.sol";

// FundTokenERC20
contract FundTokenERC20 is ERC20 {
    FundMe fundMe;

    constructor(address _addr) ERC20("FundTokenERC20Token", "fterc20t") {
        fundMe = FundMe(_addr);
    }

    // 铸造token
    function mint(uint256 aountToMint) public {
        require(fundMe.getFundSuccess(), "the fundme is not completed yet");
        require(
            fundMe.funderMap(msg.sender) >= aountToMint,
            "you do not have enough balance to transfer"
        );
        _mint(msg.sender, aountToMint);
        fundMe.updateFunderAmout(
            msg.sender,
            fundMe.funderMap(msg.sender) - aountToMint
        );
    }

    // 使用token
    function claim(uint256 amountToClaim) public {
        require(
            balanceOf(msg.sender) >= amountToClaim,
            "you dont have enough ERC20 tokens"
        );
        // 执行使用逻辑
        // 销毁token
        _burn(msg.sender, amountToClaim);
    }
}
