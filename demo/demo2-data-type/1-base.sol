// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// 基础数据类型
contract Base {
    
    // 布尔类型
    bool boolVal = true;

    // 整数类型 int是int256别名
    int intVal = 1;
    int256 int256Val = 2;

    // 无符号整数类型 uint是uint256别名
    uint uintVal = 1;
    uint256 uint256Val = 2;

    // 定长字节数组 无别名
    bytes32 bytes32Val = "123456789";

    // 字符串
    string stringVal = "hello word";

    // 地址
    address addressVal = 0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF;

}
