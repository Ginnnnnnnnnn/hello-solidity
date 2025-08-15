// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {MyNft} from "./MyNft.sol";

// NFT拍卖合约
// 1.创建拍卖
// 2.参与拍卖
// 3.结束拍卖
contract NftAuction is Initializable, UUPSUpgradeable {
    // 状态变量
    mapping(uint256 => Auction) public auctions;
    // 下一个拍卖单ID
    uint256 public nextAuctionId;
    // 管理员地址
    address public admin;

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
        address nftAddress;
        // NFT ID
        uint256 nftId;
    }

    function initialize() public initializer {
        admin = msg.sender;
    }

    // 创建拍卖
    function createAuction(
        uint256 _duration,
        uint256 _startPrice,
        address _nftAddress,
        uint256 _nftId
    ) public {
        // 检查参数
        require(msg.sender == admin, "only admin can create auctions");
        require(_duration >= 60, "duration must be >= 60");
        require(_startPrice > 0, "startPrice must be > 0");
        // 转移NFT到合约
        IERC721 nftContract = IERC721(_nftAddress);
        nftContract.safeTransferFrom(msg.sender, address(this), _nftId);
        // 创建拍卖
        auctions[nextAuctionId] = Auction({
            seller: msg.sender,
            startTime: block.timestamp,
            duration: _duration,
            startPrice: _startPrice,
            ended: false,
            highestBidder: address(0),
            highestBid: 0,
            nftAddress: _nftAddress,
            nftId: _nftId
        });
        nextAuctionId++;
    }

    // 卖家参与拍卖
    function placeBid(uint256 _auctionId) external payable {
        Auction storage auction = auctions[_auctionId];
        // 判断拍卖是否结束
        require(auction.ended == false, "auction has ended");
        require(
            block.timestamp <= auction.startTime + auction.duration,
            "auction time is ended"
        );
        // 参与金额
        uint256 payValue = msg.value;
        // 判断出价是否大于起拍价
        require(payValue > auction.startPrice, "price must be > startPrice");
        // 判断出价是否大于最高价
        require(payValue > auction.highestBid, "price must be > highestBid");
        // 如果大于上一个出价者需要退款
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        // 更新最高者信息
        auction.highestBidder = msg.sender;
        auction.highestBid = payValue;
    }

    // 结束拍卖
    function endAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        // 检查拍卖是否结束
        require(auction.ended == false, "auction has ended");
        require(
            block.timestamp > auction.startTime + auction.duration,
            "auction is not ended"
        );
        // 判断是否有人参与
        if (auction.highestBidder == address(0)) {
            // 没人参与返还NFT给卖家
            IERC721 nftContract = IERC721(auction.nftAddress);
            nftContract.safeTransferFrom(
                address(this),
                auction.seller,
                auction.nftId
            );
        } else {
            // 转移NFT到最高出价者
            IERC721 nftContract = IERC721(auction.nftAddress);
            nftContract.safeTransferFrom(
                address(this),
                auction.highestBidder,
                auction.nftId
            );
            // 转移资金到卖家
            payable(auction.seller).transfer(auction.highestBid);
        }
        // 标记拍卖为已结束
        auction.ended = true;
    }

    function _authorizeUpgrade(address) internal view override {
        // 只有管理员可以升级合约
        require(msg.sender == admin, "Only admin can upgrade");
    }

    function onERC721Received(
        address, /* operator */
        address, /* from */
        uint256, /* tokenId */
        bytes calldata /* data */
    ) external pure returns (bytes4) {
        // 必须返回这个值
        return this.onERC721Received.selector;
    }
}
