// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// 二分查找 (Binary Search)
// 题目描述：在一个有序数组中查找目标值。
contract BinarySearch {
    function search(
        uint256 num,
        uint256[] memory nums
    ) public pure returns (int256) {
        uint256 left = 0;
        uint256 right = nums.length - 1;
        while (left <= right) {
            uint256 mid = left + (right - left) / 2;
            if (nums[mid] == num) {
                return int256(mid); // 找到目标值，返回索引
            } else if (nums[mid] < num) {
                left = mid + 1; // 在右半部分继续查找
            } else {
                right = mid - 1; // 在左半部分继续查找
            }
        }
        return -1; // 未找到目标值，返回-1
    }
}
