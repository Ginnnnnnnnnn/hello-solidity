// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// 父合约
contract Parent {
    uint256 public amount;

    function add(uint256 _amount) public {
        amount += _amount;
    }
}

// 子合约
// 子合约继承父合约可以直接使用父合约中非 privete 和 external 修饰的变量和方法
contract Child is Parent {
    function sub(uint256 _amount) public {
        amount -= _amount;
    }
}
