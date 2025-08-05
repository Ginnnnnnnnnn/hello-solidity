// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// 父合约 - 抽象合约
abstract contract Parent {
    uint256 public amount;

    function add(uint256 _amount) public {
        amount += _amount;
    }

    // 虚方法,虚方法子合约必须实现
    function sub(uint256 _amount) public virtual;

    // 虚方法,有函数体子合约不用必须实现
    function show() public virtual returns (uint256) {
        return amount;
    }
}

// 子合约
contract Child is Parent {
    // 通过 override 关键字来重写父合约虚函数
    function sub(uint256 _amount) public override {
        amount -= _amount;
    }
}
