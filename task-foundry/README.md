# Task-Foundry
Foundry 是一个用 Rust 编写的用于以太坊应用程序开发的超快速、可移植和模块化工具包。
- **Forge：** 用于测试、编译和部署智能合约。
- **Cast：** 用于与区块链交互、调用合约的命令行工具。
- **Anvil：** 一个本地的以太坊节点，用于开发和测试。
- **Chisel：** Solidity REPL，快速地编写、测试和调试 Solidity 代码片段。

## 安装（windows）
- 访问 [Foundry Releases](https://github.com/foundry-rs/foundry/releases)
- 下载适用于 Windows 的预编译二进制文件
- 解压并添加到 PATH 环境变量

## 初始化
- **指令**
    ``` 
    forge init my_project
    cd my_project
    ```

- **项目结构**
    ``` 
    my_project/
    ├── lib/          # 依赖库（默认安装 ds-test，其他库需要手动添加）
    ├── src/          # 你的智能合约源文件（.sol）放在这里
    ├── test/         # 测试文件（.t.sol）放在这里
    ├── script/       # 部署脚本（.s.sol）放在这里
    └── foundry.toml  # 配置文件
    ``` 

## 常用指令
```
# 安装依赖
forge install
forge install <github-org/repo-name>

# 移除依赖
forge remove
forge remove <dependency-name>

# 更新依赖
forge update
forge update <dependency-name>

# 编译合约
forge build

# 测试合约
forge test
# 显示详细输出
forge test -v 
forge test -vv # 更详细
forge test -vvv # 显示所有交易轨迹
# 显示Gas消耗报告
forge test --gas-report 
# 运行特定测试文件
forge test --match-path test/Counter.t.sol 
# 运行特定测试函数
forge test --match-test testIncrement 
# 运行包含特定字符串的测试
forge test --match-contract CounterTest 
# 运行测试并进入调试模式
forge test --debug <TEST_FUNCTION_NAME>

# 生成测试覆盖率报告
forge coverage
# 生成LCov格式的覆盖率报告（用于其他工具可视化）
forge coverage --report lcov
# 在浏览器中查看覆盖率报告
forge coverage && open coverage/index.html

# 部署合约
forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
# 部署合约-实际部署
forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key> --broadcast

# 验证合约
forge verify-contract <contract-address> <contract-path> --chain-id <chain-id> --etherscan-api-key <etherscan-api-key> --compiler-version <compiler-version>