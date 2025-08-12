// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// 用 solidity 实现整数转罗马数字
contract RomanToNumber {
    mapping(bytes1 => uint256) romanNumberMap;

    constructor() {
        romanNumberMap["I"] = 1;
        romanNumberMap["V"] = 5;
        romanNumberMap["X"] = 10;
        romanNumberMap["L"] = 50;
        romanNumberMap["C"] = 100;
        romanNumberMap["D"] = 500;
        romanNumberMap["M"] = 1000;
    }

    function toNumber(string memory romanStr) public view returns (uint256) {
        uint256 num = 0;
        bytes memory romanByte = bytes(romanStr);
        uint256 romanByteLength = romanByte.length;
        for (uint256 i = 0; i < romanByteLength; ++i) {
            uint256 value = romanNumberMap[romanByte[i]];
            if (
                i < romanByteLength - 1 &&
                value < romanNumberMap[romanByte[i + 1]]
            ) {
                num -= value;
            } else {
                num += value;
            }
        }
        return num;
    }
}
