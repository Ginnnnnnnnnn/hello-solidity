// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Counter} from "../src/Counter.sol";
import {console} from "forge-std/console.sol";

contract CounterTest is Test {
    Counter public counter;

    // 在每个测试前运行
    function setUp() public {
        console.log("init contract");
        counter = new Counter();
        console.log("init contract success:", address(counter));
    }

    function test_Increment() public {
        counter.increment();
        assertEq(counter.number(), 1);
    }

    function testFuzz_SetNumber(uint256 x) public {
        counter.setNumber(x);
        assertEq(counter.number(), x);
    }
}
