// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NftAuction is Initializable {
    struct Auction {
        // 卖家
        address seller;
        // 拍卖开始时间
        uint256 startTime;
        // 拍卖持续时间
        uint256 duration;
        // 起始价格
        uint256 startPrice;
        // 是否结束
        bool ended;
        // 最高出价者
        address highestBidder;
        // 最高价格
        uint256 highestBid;
        // NFT合约地址
        address nftContract;
        // NFT ID
        uint256 nftId;
    }
    // 状态变量
    mapping(uint256 => Auction) public auctions;
    // 下一个拍卖单ID
    uint256 public nextAuctionId;
    // 管理员地址
    address public admin;

    function initialize() public initializer {
        admin = msg.sender;
    }

    // 创建拍卖
    function createAuction(
        uint256 _duration,
        uint256 _startPrice,
        address _nftAddress,
        uint256 nftId
    ) public {
        // 只有管理员可以创建
        require(msg.sender == admin, "only admin can create auctions");
        // 检查参数
        require(_duration > 60 * 1000, "duration must be > 60");
        require(_startPrice > 0, "startPrice must be > 0");
        // 创建拍卖
        auctions[nextAuctionId] = Auction({
            seller: msg.sender,
            startTime: block.timestamp,
            duration: _duration,
            startPrice: _startPrice,
            ended: false,
            highestBidder: address(0),
            highestBid: 0,
            nftContract: _nftAddress,
            nftId: nftId
        });
        nextAuctionId++;
    }

    // 卖家参与拍卖
    function placeBid(uint256 _auctionId) external payable {
        Auction storage auction = auctions[_auctionId];
        // 检查拍卖是否结束
        require(
            auction.startTime + auction.duration > block.timestamp,
            "auction is ended"
        );
        // 判断出价是否大于起拍价
        require(msg.value > auction.startPrice, "price must be > startPrice");
        // 判断出价是否大于最高价
        require(msg.value > auction.highestBid, "price must be > highestBid");
        // 如果大于上一个出价者需要退款
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        // 更新最高者信息
        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
    }
}
