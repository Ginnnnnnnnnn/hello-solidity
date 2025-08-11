// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// 反转字符串 (Reverse String)
// 题目描述：反转一个字符串。输入 "abcde"，输出 "edcba"
contract ReverseString {
    function reverse(string memory str) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        uint length = strBytes.length;
        bytes memory reversed = new bytes(length);
        for (uint i = 0; i < length; i++) {
            reversed[i] = strBytes[length - 1 - i];
        }
        return string(reversed);
    }
}
