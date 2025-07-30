// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// 引用类型
contract Rreference{

    // struct 结构体
    struct User {
        int id;
        string name;
        address addr;
    }

    // array 数组
    User[] users;

    // mapping 映射
    mapping(int => User) userMap;

    function addUser(int id, string memory name) public {
        User memory user = User(id, name, msg.sender);
        users.push(user);
        userMap[id] = user;
    }

    function getUserArray(int id)public view returns (User memory)  {
        for (uint i = 0; i < users.length; i++) {
            User memory user = users[i];
            if (user.id == id) {
                return user;
            }
        }
        return User(1, "123", 0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF);
    }

    function getUserMap(int id)public view returns (User memory)  {
        User memory user = userMap[id];
        if (user.id == id) {
            return user;
        }
        return User(1, "123", 0xdCad3a6d3569DF655070DEd06cb7A1b2Ccd1D3AF);
    }

}