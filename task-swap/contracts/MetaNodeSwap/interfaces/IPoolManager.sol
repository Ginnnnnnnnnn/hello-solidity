// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
pragma abicoder v2;

import "./IFactory.sol";

// 交易池合约接口
interface IPoolManager is IFactory {
    // 交易池信息
    struct PoolInfo {
        // 交易池
        address pool;
        // 代币0
        address token0;
        // 代币1
        address token1;
        // 下标
        uint32 index;
        // 费用
        uint24 fee;
        // 费用协议
        uint8 feeProtocol;
        // 用于干扰创建合约地址计算
        int24 tickLower;
        // 用于干扰创建合约地址计算
        int24 tickUpper;
        // 用于干扰创建合约地址计算
        int24 tick;
        // 价格
        uint160 sqrtPriceX96;
        // 流动性
        uint128 liquidity;
    }

    // 交易对
    struct Pair {
        // 代币0
        address token0;
        // 代币1
        address token1;
    }

    // 创建并且初始化交易池参数
    struct CreateAndInitializeParams {
        // 代币0
        address token0;
        // 代币1
        address token1;
        // 费用
        uint24 fee;
        // 用于干扰创建合约地址计算
        int24 tickLower;
        // 用于干扰创建合约地址计算
        int24 tickUpper;
        // 价格
        uint160 sqrtPriceX96;
    }

    function getPairs() external view returns (Pair[] memory);

    function getAllPools() external view returns (PoolInfo[] memory poolsInfo);

    function createAndInitializePoolIfNecessary(
        CreateAndInitializeParams calldata params
    ) external payable returns (address pool);
}
