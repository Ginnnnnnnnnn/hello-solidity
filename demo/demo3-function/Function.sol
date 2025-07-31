// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// 函数
// ============== 可见性修饰符 ==============
//          本类    外部    子类    外部账户
// pulic    √       √       √       √
// private  √       ×       ×       ×
// internal √       ×       √       ×
// external ×       √       ×       √
// ============== 可见性修饰符 ==============
// pure         不允许修改或访问状态变量。
// view         不允许修改状态变量。
// payable      允许从调用中接收以太币。
// constant     不允许赋值（除初始化以外），不会占据存储插槽（storage slot）。
// immutable    允许在构造时分配并在部署时保持不变。存储在代码中。
// anonymous    不把事件签名作为 topic 存储。
// indexed      将参数作为 topic 存储。
// virtual      允许在派生合约中改变函数或修改器的行为。
// override     表示该函数、修改器或公共状态变量改变了基类合约中的函数或修改器的行为。
// ============== 存储修饰符 ==============
// storage  存储在区块链上，在函数调用之间保持持久性，类似于计算机的硬盘存储。
// memory   仅在函数执行期间存在
// calldata 仅在函数执行期间存在，不可修改
contract Function1 {
    
   string strVal = "123456";

    function getString() public view returns (string memory){
        return strVal;
    }

    function setString(string memory newString) public {
        strVal = newString;
    }

    function appendString() public view returns (string memory){
        return append(strVal);
    }

    function append(string memory str) internal  pure returns(string memory){
        return string.concat(str, "~~~~~~");
    }

}
