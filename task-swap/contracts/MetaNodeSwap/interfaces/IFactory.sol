// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;

// 工厂合约接口
interface IFactory {
    // 创建池参数
    struct Parameters {
        // 工厂地址
        address factory;
        // 代币A
        address tokenA;
        // 代币B
        address tokenB;
        // 用于干扰创建合约地址计算
        int24 tickLower;
        // 用于干扰创建合约地址计算
        int24 tickUpper;
        // 费用
        uint24 fee;
    }

    function parameters()
        external
        view
        returns (
            address factory,
            address tokenA,
            address tokenB,
            int24 tickLower,
            int24 tickUpper,
            uint24 fee
        );

    event PoolCreated(
        address token0,
        address token1,
        uint32 index,
        int24 tickLower,
        int24 tickUpper,
        uint24 fee,
        address pool
    );

    function getPool(
        address tokenA,
        address tokenB,
        uint32 index
    ) external view returns (address pool);

    function createPool(
        address tokenA,
        address tokenB,
        int24 tickLower,
        int24 tickUpper,
        uint24 fee
    ) external returns (address pool);
}
