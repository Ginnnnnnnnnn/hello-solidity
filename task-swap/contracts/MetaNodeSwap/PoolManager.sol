// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.24;
pragma abicoder v2;

import "./interfaces/IPoolManager.sol";
import "./Factory.sol";
import "./interfaces/IPool.sol";

// 交易池合约
contract PoolManager is Factory, IPoolManager {
    // 交易对
    Pair[] public pairs;

    /**
     * @notice 获取所有交易对
     */
    function getPairs() external view override returns (Pair[] memory) {
        return pairs;
    }

    /**
     * @notice 获取所有交易池
     */
    function getAllPools()
        external
        view
        override
        returns (PoolInfo[] memory poolsInfo)
    {
        // 获取所有交易池数量
        uint32 length = 0;
        for (uint32 i = 0; i < pairs.length; i++) {
            length += uint32(pools[pairs[i].token0][pairs[i].token1].length);
        }
        // 再填充数据
        uint256 index;
        poolsInfo = new PoolInfo[](length);
        for (uint32 i = 0; i < pairs.length; i++) {
            // 获取交易池
            address[] memory addresses = pools[pairs[i].token0][
                pairs[i].token1
            ];
            for (uint32 j = 0; j < addresses.length; j++) {
                IPool pool = IPool(addresses[j]);
                poolsInfo[index] = PoolInfo({
                    pool: addresses[j],
                    token0: pool.token0(),
                    token1: pool.token1(),
                    index: j,
                    fee: pool.fee(),
                    feeProtocol: 0,
                    tickLower: pool.tickLower(),
                    tickUpper: pool.tickUpper(),
                    tick: pool.tick(),
                    sqrtPriceX96: pool.sqrtPriceX96(),
                    liquidity: pool.liquidity()
                });
                index++;
            }
        }
        return poolsInfo;
    }

    /**
     * @notice 创建并且初始化交易池
     * @param params 参数
     */
    function createAndInitializePoolIfNecessary(
        CreateAndInitializeParams calldata params
    ) external payable override returns (address poolAddress) {
        // 代币地址不能是同一个
        require(
            params.token0 < params.token1,
            "token0 must be less than token1"
        );
        // 创建交易池
        poolAddress = this.createPool(
            params.token0,
            params.token1,
            params.tickLower,
            params.tickUpper,
            params.fee
        );
        // 处理交易池和交易对信息
        IPool pool = IPool(poolAddress);
        uint256 index = pools[pool.token0()][pool.token1()].length;
        // 新创建的池子，没有初始化价格，需要初始化价格
        if (pool.sqrtPriceX96() == 0) {
            pool.initialize(params.sqrtPriceX96);
            if (index == 1) {
                // 如果是第一次添加该交易对，需要记录
                pairs.push(
                    Pair({token0: pool.token0(), token1: pool.token1()})
                );
            }
        }
    }
}
