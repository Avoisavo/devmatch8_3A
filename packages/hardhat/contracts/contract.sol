// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * UserSummaryStorage: Minimal per-user storage for chat summaries.
 * - Stores only an array of summaries (bytes)
 * - Only the designated user can append to their summaries
 */
contract UserSummaryStorage {
    address public immutable user;
    bytes[] private summaries;
    
    event SummaryAdded(address indexed user, uint256 indexed index, uint256 timestamp);

    modifier onlyUser() {
        require(msg.sender == user, "Not user");
        _;
    }

    constructor(address _user) {
        require(_user != address(0), "Invalid user");
        user = _user;
    }

    /**
     * Append a new summary (encrypted or plain) to the user's summaries array.
     * Returns the index of the newly stored summary.
     */
    function addSummary(bytes calldata summary) external onlyUser returns (uint256 index) {
        summaries.push(summary);
        index = summaries.length - 1;
        emit SummaryAdded(user, index, block.timestamp);
    }

    /**
     * Read a single summary by index.
     */
    function getSummary(uint256 index) external view returns (bytes memory) {
        return summaries[index];
    }

    /**
     * Get the total number of summaries stored.
     */
    function summariesCount() external view returns (uint256) {
        return summaries.length;
    }
}

/**
 * SubscriptionAndSummaryFactory: Handles subscription payments and acts as a factory/registry
 * for per-user UserSummaryStorage contracts. If a user already has a storage contract, it reuses it;
 * otherwise it deploys a new one. Also tracks subscription validity for one month per payment.
 */
contract SubscriptionAndSummaryFactory {
    struct Subscription {
        uint256 expiresAt; // subscription expiry timestamp
    }

    // user => subscription info
    mapping(address => Subscription) public subscriptions;

    // user => deployed summary storage contract
    mapping(address => address) public userSummaryContract;

    // Events
    event SubscriptionPaid(address indexed user, uint256 amount, uint256 expiresAt);
    event UserSummaryContractCreated(address indexed user, address summaryContract);

    uint256 public constant ONE_MONTH = 30 days; // approximate month duration

    /**
     * Pay to start or extend a subscription by one month from the later of now or current expiry.
     * Any positive amount is accepted and recorded.
     */
    function paySubscription() external payable {
        require(msg.value > 0, "No payment");

        Subscription storage sub = subscriptions[msg.sender];

        uint256 base = sub.expiresAt > block.timestamp ? sub.expiresAt : block.timestamp;
        sub.expiresAt = base + ONE_MONTH;

        emit SubscriptionPaid(msg.sender, msg.value, sub.expiresAt);

        // Auto-create or fetch the summary storage for the payer right after payment
        // This ensures the user has a summary storage contract available immediately.
        getOrCreateUserSummaryContract(msg.sender);
    }

    /**
     * Returns true if user's subscription is active (not expired).
     */
    function isActive(address user) external view returns (bool) {
        return subscriptions[user].expiresAt >= block.timestamp;
    }

    /**
     * Get or deploy the summary storage contract for a specific user.
     * If it doesn't exist, creates a new one and registers it.
     */
    function getOrCreateUserSummaryContract(address user) public returns (address) {
        require(user != address(0), "Invalid user");

        address deployed = userSummaryContract[user];
        if (deployed == address(0)) {
            UserSummaryStorage summary = new UserSummaryStorage(user);
            deployed = address(summary);
            userSummaryContract[user] = deployed;
            emit UserSummaryContractCreated(user, deployed);
        }
        return deployed;
    }

    /** Convenience wrapper for msg.sender. */
    function getOrCreateMySummaryContract() external returns (address) {
        return getOrCreateUserSummaryContract(msg.sender);
    }

    /**
     * Convenience method to append a summary into the caller's storage contract via the factory.
     * Deploys the storage contract if not yet created.
     */
    function addMySummary(bytes calldata summary) external returns (uint256 index) {
        address store = getOrCreateUserSummaryContract(msg.sender);
        index = UserSummaryStorage(store).addSummary(summary);
    }
}
