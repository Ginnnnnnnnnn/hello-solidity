// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;

import "./interfaces/IFactory.sol";
import "./Pool.sol";

// 工厂合约
contract Factory is IFactory {
    // Pool合约映射
    mapping(address => mapping(address => address[])) public pools;

    // 创建池参数
    Parameters public override parameters;

    /**
     * @notice 排序代币
     * 根据地址排序，防止 tokenA -> tokenB 和 tokenB -> tokenA 的无效对出现
     * @param tokenA 代币A
     * @param tokenB 代币B
     */
    function sortToken(
        address tokenA,
        address tokenB
    ) private pure returns (address, address) {
        // 根据地址排序
        return tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    /**
     * @notice 获取池信息
     * @param tokenA 代币A
     * @param tokenB 代币B
     * @param index 序号
     */
    function getPool(
        address tokenA,
        address tokenB,
        uint32 index
    ) external view override returns (address) {
        // 代币地址不能是同一个
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        // 代币地址不能是 address(0)
        require(tokenA != address(0) && tokenB != address(0), "ZERO_ADDRESS");
        // 排序
        address token0;
        address token1;
        (token0, token1) = sortToken(tokenA, tokenB);
        // 返回池信息
        return pools[token0][token1][index];
    }

    /**
     * @notice 创建池
     * @param tokenA 代币A
     * @param tokenB 代币B
     * @param tickLower 用于干扰创建合约地址计算
     * @param tickUpper 用于干扰创建合约地址计算
     * @param fee 费用
     */
    function createPool(
        address tokenA,
        address tokenB,
        int24 tickLower,
        int24 tickUpper,
        uint24 fee
    ) external override returns (address pool) {
        // 代币地址不能是同一个
        require(tokenA != tokenB, "IDENTICAL_ADDRESSES");
        // 排序
        address token0;
        address token1;
        (token0, token1) = sortToken(tokenA, tokenB);
        // 获取交易对所有池信息
        address[] memory existingPools = pools[token0][token1];
        for (uint256 i = 0; i < existingPools.length; i++) {
            // 检查池是否已存在
            IPool currentPool = IPool(existingPools[i]);
            if (
                currentPool.tickLower() == tickLower &&
                currentPool.tickUpper() == tickUpper &&
                currentPool.fee() == fee
            ) {
                return existingPools[i];
            }
        }
        // 使用前，暂存创建池参数
        parameters = Parameters(
            address(this),
            token0,
            token1,
            tickLower,
            tickUpper,
            fee
        );
        // 生成创建合约用的盐
        bytes32 salt = keccak256(
            abi.encode(token0, token1, tickLower, tickUpper, fee)
        );
        // 创建池
        pool = address(new Pool{salt: salt}());
        pools[token0][token1].push(pool);
        // 使用后，删除创建池参数
        delete parameters;
        emit PoolCreated(
            token0,
            token1,
            uint32(existingPools.length),
            tickLower,
            tickUpper,
            fee,
            pool
        );
    }
}
