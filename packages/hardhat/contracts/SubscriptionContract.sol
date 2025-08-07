//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

/**
 * A smart contract that handles subscription payments in ROSE tokens
 * Users pay 1 ROSE token to subscribe to the service
 * @author BuidlGuidl
 */
contract SubscriptionContract {
    // State Variables
    address public immutable owner;
    uint256 public subscriptionPrice = 1 ether; // 1 ROSE token
    uint256 public totalSubscribers = 0;
    
    // Subscription tracking
    mapping(address => bool) public subscribers;
    mapping(address => uint256) public subscriptionTimestamp;
    mapping(address => uint256) public subscriptionCount;
    
    // Events
    event SubscriptionPurchased(address indexed subscriber, uint256 amount, uint256 timestamp);
    event SubscriptionCancelled(address indexed subscriber, uint256 timestamp);
    event PriceUpdated(uint256 newPrice, uint256 timestamp);
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 timestamp);

    // Constructor
    constructor(address _owner) {
        owner = _owner;
        console.log("SubscriptionContract deployed by:", _owner);
    }

    // Modifier
    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }



    modifier isSubscribed() {
        require(subscribers[msg.sender], "Not subscribed");
        _;
    }

    /**
     * Function to subscribe to the service
     * Users can subscribe multiple times to extend their subscription
     * Requires exactly 1 ROSE token payment per subscription
     */
    function subscribe() public payable {
        require(msg.value >= subscriptionPrice, "Insufficient payment: 1 ROSE token required");
        
        console.log("New subscription from:", msg.sender, "Amount:", msg.value);
        
        // Track subscription - first time subscribers increment total count
        if (!subscribers[msg.sender]) {
            totalSubscribers += 1;
        }
        
        // Mark user as subscribed and update timestamp
        subscribers[msg.sender] = true;
        subscriptionTimestamp[msg.sender] = block.timestamp;
        subscriptionCount[msg.sender] += 1;
        
        // Refund excess payment if any
        if (msg.value > subscriptionPrice) {
            uint256 refund = msg.value - subscriptionPrice;
            (bool refundSuccess, ) = msg.sender.call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit SubscriptionPurchased(msg.sender, subscriptionPrice, block.timestamp);
    }

    /**
     * Function to cancel subscription
     * No refund - subscription remains valid until cancellation
     */
    function cancelSubscription() public isSubscribed {
        subscribers[msg.sender] = false;
        totalSubscribers -= 1;
        
        emit SubscriptionCancelled(msg.sender, block.timestamp);
    }

    /**
     * Check if an address is subscribed
     */
    function isUserSubscribed(address _user) public view returns (bool) {
        return subscribers[_user];
    }

    /**
     * Get subscription timestamp for a user
     */
    function getSubscriptionTime(address _user) public view returns (uint256) {
        require(subscribers[_user], "User not subscribed");
        return subscriptionTimestamp[_user];
    }

    /**
     * Get subscription count for a user
     */
    function getSubscriptionCount(address _user) public view returns (uint256) {
        return subscriptionCount[_user];
    }

    /**
     * Owner function to update subscription price
     */
    function setSubscriptionPrice(uint256 _newPrice) public isOwner {
        require(_newPrice > 0, "Price must be greater than 0");
        subscriptionPrice = _newPrice;
        emit PriceUpdated(_newPrice, block.timestamp);
    }

    /**
     * Owner function to withdraw collected subscription fees
     */
    function withdraw() public isOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(owner, balance, block.timestamp);
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