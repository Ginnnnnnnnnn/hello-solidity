// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// FundToken
contract FundToken {
    string public tokenName;

    string public tokenSymbol;

    uint256 public totalSupply;

    address public owner;

    mapping(address => uint256) public balances;

    constructor(string memory _tokenName, string memory _tokenSymbol) {
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
        owner = msg.sender;
    }

    function mint(uint256 aountToMint) public {
        balances[msg.sender] += aountToMint;
        totalSupply += aountToMint;
    }

    function transfer(address addr, uint256 amount) public {
        require(
            balances[msg.sender] >= amount,
            "you do not have enough balance to transfer"
        );
        balances[msg.sender] -= amount;
        balances[addr] += amount;
    }

    function balanceOf(address addr) public view returns (uint256) {
        return balances[addr];
    }
}
