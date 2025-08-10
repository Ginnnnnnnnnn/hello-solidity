// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {MyToken} from "./MyToken.sol";

contract WarppendMyToken is MyToken {
    constructor(
        string memory tokenName,
        string memory tokenSymbol
    ) MyToken(tokenName, tokenSymbol) {}

    function miniTokenWithSpecificTokenId(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}
