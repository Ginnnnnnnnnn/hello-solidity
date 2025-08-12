// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// 合并两个有序数组 (Merge Sorted Array)
// 题目描述：将两个有序数组合并为一个有序数组。
contract MergeArray {
    function merge(
        uint256[] memory arrayOne,
        uint256[] memory arrayTwo
    ) public pure returns (uint256[] memory) {
        uint256[] memory mergedArray = new uint256[](
            arrayOne.length + arrayTwo.length
        );
        uint256 index = 0;

        // 将第一个数组的元素添加到合并数组中
        for (uint256 i = 0; i < arrayOne.length; i++) {
            mergedArray[index] = arrayOne[i];
            index++;
        }

        // 将第二个数组的元素添加到合并数组中
        for (uint256 j = 0; j < arrayTwo.length; j++) {
            mergedArray[index] = arrayTwo[j];
            index++;
        }

        // 排序
        for (uint256 i = 0; i < mergedArray.length - 1; i++) {
            for (uint256 j = i + 1; j < mergedArray.length; j++) {
                if (mergedArray[i] > mergedArray[j]) {
                    uint256 temp = mergedArray[i];
                    mergedArray[i] = mergedArray[j];
                    mergedArray[j] = temp;
                }
            }
        }

        return mergedArray;
    }
}
