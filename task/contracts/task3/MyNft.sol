// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNft is ERC721 {
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {}
}
