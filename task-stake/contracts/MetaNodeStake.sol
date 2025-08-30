// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

contract MetaNodeStake is
    Initializable,
    UUPSUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable
{
    // ************************************** 库附着 **************************************
    using SafeERC20 for IERC20;
    using Address for address;
    using Math for uint256;

    // ************************************** 常量 **************************************

    // 角色
    bytes32 public constant ADMIN_ROLE = keccak256("admin_role");
    bytes32 public constant UPGRADE_ROLE = keccak256("upgrade_role");

    // ETH 代币池 ID
    uint256 public constant ETH_PID = 0;

    // ************************************** 结构体 **************************************

    // 代币池信息
    struct Pool {
        // 质押代币的地址
        address stTokenAddress;
        // 代币池权重
        uint256 poolWeight;
        // 最后结算奖励区块高度
        uint256 lastRewardBlock;
        // 每个代币可以得到的奖励代币数量
        uint256 accMetaNodePerST;
        // 质押代币数量
        uint256 stTokenAmount;
        // 最小质押数量
        uint256 minDepositAmount;
        // 解锁等待区块数量
        uint256 unstakeLockedBlocks;
    }

    // 提现信息
    struct UnstakeRequest {
        // 提现金额
        uint256 amount;
        // 可提现区块高度
        uint256 unlockBlocks;
    }

    // 用户信息
    struct User {
        // 质押代币数量
        uint256 stAmount;
        // 累计获取奖励代币数量
        uint256 finishedMetaNode;
        // 待提现奖励代币数量
        uint256 pendingMetaNode;
        // 解锁申请列表
        UnstakeRequest[] requests;
    }

    // ************************************** 状态变量 **************************************
    // 开始区块高度
    uint256 public startBlock;
    // 结束区块高度
    uint256 public endBlock;
    // 每个区块的奖励代币数量
    uint256 public MetaNodePerBlock;

    // 提现功能开关
    bool public withdrawPaused;
    // 领取功能开关
    bool public claimPaused;

    // 奖励代币
    IERC20 public MetaNode;

    // 全部代币池总权重
    uint256 public totalPoolWeight;
    // 代币池列表
    Pool[] public pool;

    // 代币池质押信息
    // 代币池ID -> 用户地址 -> 用户信息
    mapping(uint256 => mapping(address => User)) public user;

    // ************************************** 事件 **************************************

    event SetMetaNode(IERC20 indexed MetaNode);

    event PauseWithdraw();

    event UnpauseWithdraw();

    event PauseClaim();

    event UnpauseClaim();

    event SetStartBlock(uint256 indexed startBlock);

    event SetEndBlock(uint256 indexed endBlock);

    event SetMetaNodePerBlock(uint256 indexed MetaNodePerBlock);

    event AddPool(
        address indexed stTokenAddress,
        uint256 indexed poolWeight,
        uint256 indexed lastRewardBlock,
        uint256 minDepositAmount,
        uint256 unstakeLockedBlocks
    );

    event UpdatePoolInfo(
        uint256 indexed poolId,
        uint256 indexed minDepositAmount,
        uint256 indexed unstakeLockedBlocks
    );

    event SetPoolWeight(
        uint256 indexed poolId,
        uint256 indexed poolWeight,
        uint256 totalPoolWeight
    );

    event UpdatePool(
        uint256 indexed poolId,
        uint256 indexed lastRewardBlock,
        uint256 totalMetaNode
    );

    event Deposit(address indexed user, uint256 indexed poolId, uint256 amount);

    event RequestUnstake(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount
    );

    event Withdraw(
        address indexed user,
        uint256 indexed poolId,
        uint256 amount,
        uint256 indexed blockNumber
    );

    event Claim(
        address indexed user,
        uint256 indexed poolId,
        uint256 MetaNodeReward
    );

    // ************************************** 修饰器 **************************************

    modifier checkPid(uint256 _pid) {
        require(_pid < pool.length, "invalid pid");
        _;
    }

    modifier whenNotClaimPaused() {
        require(!claimPaused, "claim is paused");
        _;
    }

    modifier whenNotWithdrawPaused() {
        require(!withdrawPaused, "withdraw is paused");
        _;
    }

    // ************************************** 初始化方法 **************************************

    /**
     * @notice 设置奖励代币地址以及基本信息
     * @param _MetaNode 奖励代币
     * @param _startBlock 开始区块
     * @param _endBlock 结束区块
     * @param _MetaNodePerBlock 每个区块的奖励代币数量
     */
    function initialize(
        IERC20 _MetaNode,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _MetaNodePerBlock
    ) public initializer {
        // 校验开始区块不能大于或等于结束区块 与 每个区块的奖励代币数量必须大于0
        require(
            _startBlock <= _endBlock && _MetaNodePerBlock > 0,
            "invalid parameters"
        );

        // 调用 权限合约 和 升级合约 初始化方法
        __AccessControl_init();
        __UUPSUpgradeable_init();

        // 设置用户角色
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPGRADE_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // 设置奖励代币
        setMetaNode(_MetaNode);

        // 设置基本信息
        startBlock = _startBlock == 0 ? block.number : _startBlock;
        endBlock = _endBlock == 0 ? startBlock + 500 : _endBlock;
        MetaNodePerBlock = _MetaNodePerBlock;
    }

    // ************************************** 升级角色方法 **************************************

    /**
     * @notice 升级合约
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADE_ROLE) {}

    // ************************************** 管理员角色方法 **************************************

    /**
     * @notice 设置奖励代币
     */
    function setMetaNode(IERC20 _MetaNode) public onlyRole(ADMIN_ROLE) {
        MetaNode = _MetaNode;
        emit SetMetaNode(MetaNode);
    }

    /**
     * @notice 暂停提现
     */
    function pauseWithdraw() public onlyRole(ADMIN_ROLE) {
        require(!withdrawPaused, "withdraw has been already paused");
        withdrawPaused = true;
        emit PauseWithdraw();
    }

    /**
     * @notice 开启提现
     */
    function unpauseWithdraw() public onlyRole(ADMIN_ROLE) {
        require(withdrawPaused, "withdraw has been already unpaused");
        withdrawPaused = false;
        emit UnpauseWithdraw();
    }

    /**
     * @notice 暂停领取
     */
    function pauseClaim() public onlyRole(ADMIN_ROLE) {
        require(!claimPaused, "claim has been already paused");
        claimPaused = true;
        emit PauseClaim();
    }

    /**
     * @notice 开启领取
     */
    function unpauseClaim() public onlyRole(ADMIN_ROLE) {
        require(claimPaused, "claim has been already unpaused");
        claimPaused = false;
        emit UnpauseClaim();
    }

    /**
     * @notice 设置开始区块
     */
    function setStartBlock(uint256 _startBlock) public onlyRole(ADMIN_ROLE) {
        require(
            _startBlock <= endBlock,
            "start block must be smaller than end block"
        );
        startBlock = _startBlock;
        emit SetStartBlock(_startBlock);
    }

    /**
     * @notice 设置结束区块
     */
    function setEndBlock(uint256 _endBlock) public onlyRole(ADMIN_ROLE) {
        require(
            startBlock <= _endBlock,
            "start block must be smaller than end block"
        );
        endBlock = _endBlock;
        emit SetEndBlock(_endBlock);
    }

    /**
     * @notice 每个区块的奖励代币数量
     */
    function setMetaNodePerBlock(
        uint256 _MetaNodePerBlock
    ) public onlyRole(ADMIN_ROLE) {
        require(_MetaNodePerBlock > 0, "invalid parameter");
        MetaNodePerBlock = _MetaNodePerBlock;
        emit SetMetaNodePerBlock(_MetaNodePerBlock);
    }

    /**
     * @notice 添加代币池
     * 不要多次添加相同的质押令牌。如果你这样做，奖励代币将被打乱。
     * @param _stTokenAddress 代币地址
     * @param _poolWeight 代币池权重
     * @param _minDepositAmount 最小质押数量
     * @param _unstakeLockedBlocks 解锁等待区块数量
     * @param _withUpdate 是否结算代币池
     */
    function addPool(
        address _stTokenAddress,
        uint256 _poolWeight,
        uint256 _minDepositAmount,
        uint256 _unstakeLockedBlocks,
        bool _withUpdate
    ) public onlyRole(ADMIN_ROLE) {
        // 默认代币池第一个是 ETH ，地址必须是 address(0x0)
        if (pool.length > 0) {
            // 地址必须是 address(0x0)
            require(
                _stTokenAddress != address(0x0),
                "invalid staking token address"
            );
        } else {
            // 地址不能是 address(0x0)
            require(
                _stTokenAddress == address(0x0),
                "invalid staking token address"
            );
        }
        // 提现等待区块必须大于0
        require(_unstakeLockedBlocks > 0, "invalid withdraw locked blocks");
        // 质押有效区块未结束
        require(block.number < endBlock, "Already ended");

        // 是否结算质押池
        if (_withUpdate) {
            massUpdatePools();
        }
        // 如果当前区块大于开始区块则取当前区块为开始区块
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        // 累加总权重
        totalPoolWeight = totalPoolWeight + _poolWeight;
        // 添加代币池
        pool.push(
            Pool({
                stTokenAddress: _stTokenAddress,
                poolWeight: _poolWeight,
                lastRewardBlock: lastRewardBlock,
                accMetaNodePerST: 0,
                stTokenAmount: 0,
                minDepositAmount: _minDepositAmount,
                unstakeLockedBlocks: _unstakeLockedBlocks
            })
        );

        emit AddPool(
            _stTokenAddress,
            _poolWeight,
            lastRewardBlock,
            _minDepositAmount,
            _unstakeLockedBlocks
        );
    }

    /**
     * @notice 更新代币池信息
     * @param _pid 代币池ID
     * @param _minDepositAmount 最小质押数量
     * @param _unstakeLockedBlocks 提现等待区块数量
     */
    function updatePool(
        uint256 _pid,
        uint256 _minDepositAmount,
        uint256 _unstakeLockedBlocks
    ) public onlyRole(ADMIN_ROLE) checkPid(_pid) {
        pool[_pid].minDepositAmount = _minDepositAmount;
        pool[_pid].unstakeLockedBlocks = _unstakeLockedBlocks;
        emit UpdatePoolInfo(_pid, _minDepositAmount, _unstakeLockedBlocks);
    }

    /**
     * @notice 设置代币池权重
     * @param _pid 代币池ID
     * @param _poolWeight 权重
     * @param _withUpdate 是否结算代币池
     */
    function setPoolWeight(
        uint256 _pid,
        uint256 _poolWeight,
        bool _withUpdate
    ) public onlyRole(ADMIN_ROLE) checkPid(_pid) {
        // 权重必须大于0
        require(_poolWeight > 0, "invalid pool weight");

        // 是否结算代币池
        if (_withUpdate) {
            massUpdatePools();
        }

        // 修改总权重
        totalPoolWeight = totalPoolWeight - pool[_pid].poolWeight + _poolWeight;

        // 更新信息
        pool[_pid].poolWeight = _poolWeight;

        emit SetPoolWeight(_pid, _poolWeight, totalPoolWeight);
    }

    // ************************************** 查询方法 **************************************

    /**
     * @notice 获取代币池长度
     */
    function poolLength() external view returns (uint256) {
        return pool.length;
    }

    /**
     * @notice 获取指定范围区块的奖励代币数量
     * @param _from 开始区块
     * @param _to 结束区块
     */
    function getMultiplier(
        uint256 _from,
        uint256 _to
    ) public view returns (uint256 multiplier) {
        require(_from <= _to, "invalid block");
        if (_from < startBlock) {
            _from = startBlock;
        }
        if (_to > endBlock) {
            _to = endBlock;
        }
        require(_from <= _to, "end block must be greater than start block");

        // 计算奖励，结束区块 - 开始区块 * 每个区块奖励数量
        bool success;
        (success, multiplier) = (_to - _from).tryMul(MetaNodePerBlock);
        require(success, "multiplier overflow");
    }

    /**
     * @notice 获取用户待提取奖励代币数量
     * @param _pid 代币池ID
     * @param _user 用户地址
     */
    function pendingMetaNode(
        uint256 _pid,
        address _user
    ) external view checkPid(_pid) returns (uint256) {
        return pendingMetaNodeByBlockNumber(_pid, _user, block.number);
    }

    /**
     * @notice 获取用户待提取奖励代币数量
     * @param _pid 代币池ID
     * @param _user 用户地址
     * @param _blockNumber 结束区块
     */
    function pendingMetaNodeByBlockNumber(
        uint256 _pid,
        address _user,
        uint256 _blockNumber
    ) public view checkPid(_pid) returns (uint256) {
        // 代币池信息
        Pool storage pool_ = pool[_pid];
        uint256 accMetaNodePerST = pool_.accMetaNodePerST;
        uint256 stSupply = pool_.stTokenAmount;
        // 用户质押信息
        User storage user_ = user[_pid][_user];
        // 计算未结算收益
        if (_blockNumber > pool_.lastRewardBlock && stSupply != 0) {
            // 总奖励数 = 获取上次结算区块到结束区块的奖励
            uint256 multiplier = getMultiplier(
                pool_.lastRewardBlock,
                _blockNumber
            );
            // 池奖励数 = ( 总奖励数量 * 池权重 ) / 总权重, 先计算 * 防止溢出
            uint256 MetaNodeForPool = (multiplier * pool_.poolWeight) /
                totalPoolWeight;
            // 单币奖励数 = 已结算单币奖励数 + ( 池奖励数量 * 1 ether ) / 池质押总数，放大1 ether保存小数
            accMetaNodePerST =
                accMetaNodePerST +
                (MetaNodeForPool * (1 ether)) /
                stSupply;
        }
        // 计算用户待提取奖励数
        // 待提取奖励数 = ( 用户抵押数 * 单代币奖励数 ) / 1 ether - 已提取 - 待提取，/ 1 ether 是因为 * 运算放大了 1 ether
        return
            (user_.stAmount * accMetaNodePerST) /
            (1 ether) -
            user_.finishedMetaNode +
            user_.pendingMetaNode;
    }

    /**
     * @notice 获取用户抵押余额
     * @param _pid 池ID
     * @param _user 用户地址
     */
    function stakingBalance(
        uint256 _pid,
        address _user
    ) external view checkPid(_pid) returns (uint256) {
        return user[_pid][_user].stAmount;
    }

    /**
     * @notice 获取提现金额（已提现，待提现）
     * @param _pid 池ID
     * @param _user 用户地址
     */
    function withdrawAmount(
        uint256 _pid,
        address _user
    )
        public
        view
        checkPid(_pid)
        returns (uint256 requestAmount, uint256 pendingWithdrawAmount)
    {
        // 获取用户质押信息
        User storage user_ = user[_pid][_user];
        // 遍历用户提现申请列表
        for (uint256 i = 0; i < user_.requests.length; i++) {
            // 判断是否过了可提现区块
            if (user_.requests[i].unlockBlocks <= block.number) {
                pendingWithdrawAmount =
                    pendingWithdrawAmount +
                    user_.requests[i].amount;
            }
            requestAmount = requestAmount + user_.requests[i].amount;
        }
    }

    // ************************************** 公开方法 **************************************

    /**
     * @notice 结算代币池
     * @param _pid 池ID
     */
    function updatePool(uint256 _pid) public checkPid(_pid) {
        // 获取池信息
        Pool storage pool_ = pool[_pid];
        // 当前区块必须大于上次结算区块
        if (block.number <= pool_.lastRewardBlock) {
            return;
        }
        // 获取上次结算区块至当前区块的奖励代币
        (bool success1, uint256 totalMetaNode) = getMultiplier(
            pool_.lastRewardBlock,
            block.number
        ).tryMul(pool_.poolWeight);
        require(success1, "overflow");
        // 每权重奖励代币数 = 总奖励代币 / 总权重
        (success1, totalMetaNode) = totalMetaNode.tryDiv(totalPoolWeight);
        require(success1, "overflow");
        // 获取池总质押数量
        uint256 stSupply = pool_.stTokenAmount;
        // 计算
        if (stSupply > 0) {
            // 放大 1 ether 奖励数，
            (bool success2, uint256 totalMetaNode_) = totalMetaNode.tryMul(
                1 ether
            );
            require(success2, "overflow");
            // 计算单币奖励数 = 总奖励代币 / 总质押币
            (success2, totalMetaNode_) = totalMetaNode_.tryDiv(stSupply);
            require(success2, "overflow");
            // 累加单币奖励数
            (bool success3, uint256 accMetaNodePerST) = pool_
                .accMetaNodePerST
                .tryAdd(totalMetaNode_);
            require(success3, "overflow");
            pool_.accMetaNodePerST = accMetaNodePerST;
        }
        // 更新最后结算区块
        pool_.lastRewardBlock = block.number;

        emit UpdatePool(_pid, pool_.lastRewardBlock, totalMetaNode);
    }

    /**
     * @notice 结算所有代币池
     */
    function massUpdatePools() public {
        uint256 length = pool.length;
        for (uint256 pid = 0; pid < length; pid++) {
            updatePool(pid);
        }
    }

    /**
     * @notice 质押 ETH
     */
    function depositETH() public payable whenNotPaused {
        // 获取 ETH 池信息
        Pool storage pool_ = pool[ETH_PID];
        require(
            pool_.stTokenAddress == address(0x0),
            "invalid staking token address"
        );
        // 获取质押数量
        uint256 _amount = msg.value;
        require(
            _amount >= pool_.minDepositAmount,
            "deposit amount is too small"
        );
        // 调用通用质押方法
        _deposit(ETH_PID, _amount);
    }

    /**
     * @notice 质押代币
     * 在存款之前，用户需要批准此合同才能使用或转移他们的质押代币
     * @param _pid 池ID
     * @param _amount 质押金额
     */
    function deposit(
        uint256 _pid,
        uint256 _amount
    ) public whenNotPaused checkPid(_pid) {
        require(_pid != 0, "deposit not support ETH staking");
        // 获取池信息
        Pool storage pool_ = pool[_pid];
        require(
            _amount > pool_.minDepositAmount,
            "deposit amount is too small"
        );
        // 转账代币
        if (_amount > 0) {
            IERC20(pool_.stTokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                _amount
            );
        }
        // 调用通用质押方法
        _deposit(_pid, _amount);
    }

    /**
     * @notice 解锁代币
     *
     * @param _pid 池ID
     * @param _amount 金额
     */
    function unstake(
        uint256 _pid,
        uint256 _amount
    ) public whenNotPaused checkPid(_pid) whenNotWithdrawPaused {
        // 获取池信息
        Pool storage pool_ = pool[_pid];
        // 获取用户质押信息
        User storage user_ = user[_pid][msg.sender];
        // 解锁金额不能大于质押总金额
        require(user_.stAmount >= _amount, "Not enough staking token balance");
        // 结算池
        updatePool(_pid);
        // 计算是否有未提现金额 = 总质押币 * 单质押币奖励数量 - 累计获取奖励
        uint256 pendingMetaNode_ = (user_.stAmount * pool_.accMetaNodePerST) /
            (1 ether) -
            user_.finishedMetaNode;
        // 增加待提现金额
        if (pendingMetaNode_ > 0) {
            user_.pendingMetaNode = user_.pendingMetaNode + pendingMetaNode_;
        }
        // 操作金额
        if (_amount > 0) {
            // 扣减用户总质押数量
            user_.stAmount = user_.stAmount - _amount;
            // 创建提现信息
            user_.requests.push(
                UnstakeRequest({
                    amount: _amount,
                    unlockBlocks: block.number + pool_.unstakeLockedBlocks
                })
            );
        }
        // 扣减池总质押数量
        pool_.stTokenAmount = pool_.stTokenAmount - _amount;
        // 重新计算累计获取奖励
        user_.finishedMetaNode =
            (user_.stAmount * pool_.accMetaNodePerST) /
            (1 ether);

        emit RequestUnstake(msg.sender, _pid, _amount);
    }

    /**
     * @notice 提现代币
     * @param _pid 池ID
     */
    function withdraw(
        uint256 _pid
    ) public whenNotPaused checkPid(_pid) whenNotWithdrawPaused {
        // 池信息
        Pool storage pool_ = pool[_pid];
        // 用户质押信息
        User storage user_ = user[_pid][msg.sender];
        // 计算待提现总金额
        uint256 pendingWithdraw_;
        uint256 popNum_;
        for (uint256 i = 0; i < user_.requests.length; i++) {
            if (user_.requests[i].unlockBlocks > block.number) {
                break;
            }
            pendingWithdraw_ = pendingWithdraw_ + user_.requests[i].amount;
            popNum_++;
        }
        // 删除提现单
        for (uint256 i = 0; i < user_.requests.length - popNum_; i++) {
            user_.requests[i] = user_.requests[i + popNum_];
        }
        for (uint256 i = 0; i < popNum_; i++) {
            user_.requests.pop();
        }
        // 转账代币
        if (pendingWithdraw_ > 0) {
            if (pool_.stTokenAddress == address(0x0)) {
                _safeETHTransfer(msg.sender, pendingWithdraw_);
            } else {
                IERC20(pool_.stTokenAddress).safeTransfer(
                    msg.sender,
                    pendingWithdraw_
                );
            }
        }

        emit Withdraw(msg.sender, _pid, pendingWithdraw_, block.number);
    }

    /**
     * @notice 领取奖励代币
     *
     * @param _pid 池ID
     */
    function claim(
        uint256 _pid
    ) public whenNotPaused checkPid(_pid) whenNotClaimPaused {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][msg.sender];
        // 结算池
        updatePool(_pid);
        // 计算可提现金额: 用户总质押代币数量 / 单代币奖励数 - 累计奖励数量 + 待提现奖励数
        uint256 pendingMetaNode_ = (user_.stAmount * pool_.accMetaNodePerST) /
            (1 ether) -
            user_.finishedMetaNode +
            user_.pendingMetaNode;
        // 转账奖励代币
        if (pendingMetaNode_ > 0) {
            // 待领取奖励数重置为0
            user_.pendingMetaNode = 0;
            // 转账奖励代币
            _safeMetaNodeTransfer(msg.sender, pendingMetaNode_);
        }
        // 重新计算累计奖励代币
        user_.finishedMetaNode =
            (user_.stAmount * pool_.accMetaNodePerST) /
            (1 ether);

        emit Claim(msg.sender, _pid, pendingMetaNode_);
    }

    // ************************************** 内部方法 **************************************

    /**
     * @notice 质押代币
     *
     * @param _pid 池ID
     * @param _amount 质押金额
     */
    function _deposit(uint256 _pid, uint256 _amount) internal {
        Pool storage pool_ = pool[_pid];
        User storage user_ = user[_pid][msg.sender];
        // 结算池
        updatePool(_pid);
        // 计算用户待领取奖励
        if (user_.stAmount > 0) {
            // uint256 accST = user_.stAmount.mulDiv(pool_.accMetaNodePerST, 1 ether);
            (bool success1, uint256 accST) = user_.stAmount.tryMul(
                pool_.accMetaNodePerST
            );
            require(success1, "user stAmount mul accMetaNodePerST overflow");
            (success1, accST) = accST.tryDiv(1 ether);
            require(success1, "accST div 1 ether overflow");

            (bool success2, uint256 pendingMetaNode_) = accST.trySub(
                user_.finishedMetaNode
            );
            require(success2, "accST sub finishedMetaNode overflow");

            if (pendingMetaNode_ > 0) {
                (bool success3, uint256 _pendingMetaNode) = user_
                    .pendingMetaNode
                    .tryAdd(pendingMetaNode_);
                require(success3, "user pendingMetaNode overflow");
                user_.pendingMetaNode = _pendingMetaNode;
            }
        }
        // 累加用户质押数量
        if (_amount > 0) {
            (bool success4, uint256 stAmount) = user_.stAmount.tryAdd(_amount);
            require(success4, "user stAmount overflow");
            user_.stAmount = stAmount;
        }
        // 累加池总质押数量
        (bool success5, uint256 stTokenAmount) = pool_.stTokenAmount.tryAdd(
            _amount
        );
        require(success5, "pool stTokenAmount overflow");
        pool_.stTokenAmount = stTokenAmount;
        // 计算用户总奖励数量
        // user_.finishedMetaNode = user_.stAmount.mulDiv(pool_.accMetaNodePerST, 1 ether);
        (bool success6, uint256 finishedMetaNode) = user_.stAmount.tryMul(
            pool_.accMetaNodePerST
        );
        require(success6, "user stAmount mul accMetaNodePerST overflow");

        (success6, finishedMetaNode) = finishedMetaNode.tryDiv(1 ether);
        require(success6, "finishedMetaNode div 1 ether overflow");

        user_.finishedMetaNode = finishedMetaNode;

        emit Deposit(msg.sender, _pid, _amount);
    }

    /**
     * @notice Safe MetaNode transfer function, just in case if rounding error causes pool to not have enough MetaNodes
     *
     * @param _to        Address to get transferred MetaNodes
     * @param _amount    Amount of MetaNode to be transferred
     */
    function _safeMetaNodeTransfer(address _to, uint256 _amount) internal {
        uint256 MetaNodeBal = MetaNode.balanceOf(address(this));

        if (_amount > MetaNodeBal) {
            MetaNode.transfer(_to, MetaNodeBal);
        } else {
            MetaNode.transfer(_to, _amount);
        }
    }

    /**
     * @notice Safe ETH transfer function
     *
     * @param _to        Address to get transferred ETH
     * @param _amount    Amount of ETH to be transferred
     */
    function _safeETHTransfer(address _to, uint256 _amount) internal {
        (bool success, bytes memory data) = address(_to).call{value: _amount}(
            ""
        );

        require(success, "ETH transfer call failed");
        if (data.length > 0) {
            require(
                abi.decode(data, (bool)),
                "ETH transfer operation did not succeed"
            );
        }
    }
}
