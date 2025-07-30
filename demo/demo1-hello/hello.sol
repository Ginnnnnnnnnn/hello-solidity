// 1.必须声明开源协议
// 2.必须声明solitidy版本
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// hello 合约
contract Hello {

    string str = "hello world";

    function get() public view returns (string memory) {
        return str;
    }

}
