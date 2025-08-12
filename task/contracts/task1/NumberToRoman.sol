// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// 用 solidity 实现罗马数字转数整数
contract NumberToRoman {
    uint256[] numbers = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    string[] romans = [
        "M",
        "CM",
        "D",
        "CD",
        "C",
        "XC",
        "L",
        "XL",
        "X",
        "IX",
        "V",
        "IV",
        "I"
    ];

    function toRoman(uint256 num) public view returns (string memory) {
        bytes memory roman;
        for (uint256 i = 0; i < numbers.length; i++) {
            uint256 value = numbers[i];
            bytes memory symbol = bytes(romans[i]);
            while (num >= value) {
                num -= value;
                roman = bytes.concat(roman, symbol);
            }
            if (num == 0) {
                break;
            }
        }
        return string(roman);
    }
}
