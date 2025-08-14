// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {NftAuction} from "./NftAuction.sol";

contract NftAuctionV2 is NftAuction {
    function testHello() public pure returns (string memory) {
        return "hello v2";
    }
}
