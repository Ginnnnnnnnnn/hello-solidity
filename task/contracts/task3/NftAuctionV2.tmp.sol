// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MyNft} from "./MyNft.sol";

// 拍卖合约V2
// 1.继承NftAuction
// 2.增加ERC20支持
// 3.增加USD作为价格尺度
contract NftAuctionV2Tmp is Initializable, UUPSUpgradeable {
    // 状态变量
    mapping(uint256 => Auction) public auctions;
    // 下一个拍卖单ID
    uint256 public nextAuctionId;
    // 管理员地址
    address public admin;
    // 预言机wei价
    mapping(address => AggregatorV3Interface) public priceFeeds;

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
        // 参与竞价的资产类型 0x 地址表示eth 其他表示ERC20
        address tokenAddress;
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
            nftId: _nftId,
            tokenAddress: address(0)
        });
        nextAuctionId++;
    }

    // 卖家参与拍卖
    function placeBid(
        uint256 _auctionId,
        uint256 amount,
        address _tokenAddress
    ) external payable {
        Auction storage auction = auctions[_auctionId];
        // 判断拍卖是否结束
        require(auction.ended == false, "auction has ended");
        require(
            block.timestamp <= auction.startTime + auction.duration,
            "auction time is ended"
        );
        // 参与金额
        // 统一价格尺度
        uint256 payValue;
        if (_tokenAddress == address(0)) {
            // 处理 ETH
            amount = msg.value;
            payValue =
                amount *
                uint256(getChainlinkDataFeedLatestAnswer(address(0)));
        } else {
            // 处理ERC20
            payValue =
                amount *
                uint256(getChainlinkDataFeedLatestAnswer(_tokenAddress));
        }
        uint256 startPriceValue = auction.startPrice *
            uint256(getChainlinkDataFeedLatestAnswer(auction.tokenAddress));

        uint256 highestBidValue = auction.highestBid *
            uint256(getChainlinkDataFeedLatestAnswer(auction.tokenAddress));
        // 判断出价是否大于起拍价
        require(payValue > startPriceValue, "price must be > startPrice");
        // 判断出价是否大于最高价
        require(payValue > highestBidValue, "price must be > highestBid");
        // 转移 ERC20 到合约
        if (_tokenAddress != address(0)) {
            IERC20 tokenContract = IERC20(_tokenAddress);
            tokenContract.transferFrom(msg.sender, address(this), amount);
        }
        // 如果大于上一个出价者需要退款
        if (auction.highestBidder != address(0)) {
            if (auction.tokenAddress == address(0)) {
                // auction.tokenAddress = _tokenAddress;
                payable(auction.highestBidder).transfer(auction.highestBid);
            } else {
                // 退回之前的ERC20
                IERC20 tokenContract = IERC20(_tokenAddress);
                tokenContract.transfer(
                    auction.highestBidder,
                    auction.highestBid
                );
            }
        }
        // 更新最高者信息
        auction.highestBidder = msg.sender;
        auction.highestBid = amount;
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
            if (auction.tokenAddress == address(0)) {
                // 如果是ETH
                payable(auction.seller).transfer(auction.highestBid);
            } else {
                // 如果是ERC20
                IERC20 tokenContract = IERC20(auction.tokenAddress);
                tokenContract.transfer(auction.seller, auction.highestBid);
            }
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

    function setPriceFeed(address tokenAddress, address _priceFeed) public {
        priceFeeds[tokenAddress] = AggregatorV3Interface(_priceFeed);
    }

    // ETH -> USD => 4617 19290000 => 4617.19290000
    // USDC -> USD => 99983542 => 0.99983542
    function getChainlinkDataFeedLatestAnswer(address tokenAddress)
        public
        view
        returns (int256)
    {
        AggregatorV3Interface priceFeed = priceFeeds[tokenAddress];
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return answer;
    }
}
