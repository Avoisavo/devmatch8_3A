//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

/**
 * A smart contract that handles subscription payments in ROSE tokens
 * Users pay 1 ROSE token to subscribe to the service
 * Adds SIWE-based owner authorization and makes sensitive state private.
 */
contract SubscriptionContract is SiweAuth {
    // Private state to avoid auto-generated public getters
    address private _owner;
    uint256 private _subscriptionPrice = 1 ether; // 1 ROSE token
    uint256 private _totalSubscribers = 0;

    // Subscription tracking (private to hide user data)
    mapping(address => bool) private _subscribers;
    mapping(address => uint256) private _subscriptionTimestamp;
    mapping(address => uint256) private _subscriptionCount;

    // Events
    event SubscriptionPurchased(address indexed subscriber, uint256 amount, uint256 timestamp);
    event SubscriptionCancelled(address indexed subscriber, uint256 timestamp);
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);

    // Constructor accepts the designated owner and the SIWE domain
    constructor(address owner_, string memory domain) SiweAuth(domain) {
        _owner = owner_;
        console.log("SubscriptionContract deployed by:", owner_);
    }

    // Owner auth: either tx sender is owner or SIWE-authenticated sender is owner
    modifier onlyOwner(bytes memory token) {
        address authSender = authMsgSender(token);
        require(msg.sender == _owner || authSender == _owner, "Not the owner");
        _;
    }

    modifier isSubscribed() {
        require(_subscribers[msg.sender], "Not subscribed");
        _;
    }

    // Public views to access private state as needed
    function owner() external view returns (address) {
        return _owner;
    }

    function subscriptionPrice() external view returns (uint256) {
        return _subscriptionPrice;
    }

    function totalSubscribers() external view returns (uint256) {
        return _totalSubscribers;
    }

    function isUserSubscribed(address user) public view returns (bool) {
        return _subscribers[user];
    }

    function getSubscriptionTime(address user) public view returns (uint256) {
        require(_subscribers[user], "User not subscribed");
        return _subscriptionTimestamp[user];
    }

    function getSubscriptionCount(address user) public view returns (uint256) {
        return _subscriptionCount[user];
    }

    /**
     * Function to subscribe to the service
     * Users can subscribe multiple times to extend their subscription
     * Requires at least 1 ROSE token payment per subscription
     */
    function subscribe() public payable {
        require(msg.value >= _subscriptionPrice, "Insufficient payment: 1 ROSE token required");

        console.log("New subscription from:", msg.sender, "Amount:", msg.value);

        // Track subscription - first time subscribers increment total count
        if (!_subscribers[msg.sender]) {
            _totalSubscribers += 1;
        }

        // Mark user as subscribed and update timestamp
        _subscribers[msg.sender] = true;
        _subscriptionTimestamp[msg.sender] = block.timestamp;
        _subscriptionCount[msg.sender] += 1;

        // Refund excess payment if any
        if (msg.value > _subscriptionPrice) {
            uint256 refund = msg.value - _subscriptionPrice;
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }

        emit SubscriptionPurchased(msg.sender, _subscriptionPrice, block.timestamp);
    }

    /**
     * Function to cancel subscription
     * No refund - subscription remains valid until cancellation
     */
    function cancelSubscription() public isSubscribed {
        _subscribers[msg.sender] = false;
        _totalSubscribers -= 1;

        emit SubscriptionCancelled(msg.sender, block.timestamp);
    }

    /**
     * Owner function to update subscription price (tx-sender only)
     */
    function setSubscriptionPrice(uint256 newPrice) public {
        require(msg.sender == _owner, "Not the owner");
        require(newPrice > 0, "Price must be greater than 0");
        _subscriptionPrice = newPrice;
        emit PriceUpdated(newPrice, block.timestamp);
    }

    /**
     * Owner function to update subscription price with SIWE token
     */
    function setSubscriptionPriceAuth(uint256 newPrice, bytes memory token) public onlyOwner(token) {
        require(newPrice > 0, "Price must be greater than 0");
        _subscriptionPrice = newPrice;
        emit PriceUpdated(newPrice, block.timestamp);
    }

    /**
     * Owner function to withdraw collected subscription fees (tx-sender only)
     */
    function withdraw() public {
        require(msg.sender == _owner, "Not the owner");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = _owner.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(_owner, balance, block.timestamp);
    }

    /**
     * Owner function to withdraw with SIWE token
     */
    function withdrawAuth(bytes memory token) public onlyOwner(token) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = _owner.call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(_owner, balance, block.timestamp);
    }

    /**
     * Get contract balance
     */
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /**
     * Function that allows the contract to receive ROSE tokens
     */
    receive() external payable {
        console.log("Received ROSE tokens:", msg.value, "from:", msg.sender);
    }
}
