// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {NftAuction} from "./NftAuction.sol";

// 拍卖合约V2
// 1.继承NftAuction
// 2.增加ERC20支持
// 3.增加USD作为价格尺度
contract NftAuctionV2 is NftAuction {
    function testHello() public pure returns (string memory) {
        return "hello v2";
    }
}
