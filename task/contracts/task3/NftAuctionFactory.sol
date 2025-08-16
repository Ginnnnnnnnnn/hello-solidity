// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {NftAuction} from "./NftAuction.sol";

// 拍卖合约工厂
contract NftAuctionFactory {
    address[] public auctions;

    function createAuction() external returns (address) {
        NftAuction auction = new NftAuction();
        auctions.push(address(auction));
        return address(auction);
    }
}
