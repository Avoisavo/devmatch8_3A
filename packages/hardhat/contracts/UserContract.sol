//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

/**
 * Minimal User Contract: stores the user address and allows the user to save chat summaries by sessionId.
 * All other functionality has been removed for simplicity.
 */
contract UserContract {
    // Basic user info
    address public user;
    uint256 public createdAt;
    bool public isInitialized;

    // sessionId => encrypted summary bytes
    mapping(bytes32 => bytes) public chatSummaries;

    // Events
    event UserContractInitialized(address indexed user, uint256 timestamp);
    event ChatSummaryStored(address indexed user, bytes32 indexed sessionId, uint256 timestamp);

    // Errors
    error ContractNotInitialized();
    error Unauthorized();
    error InvalidSessionId();

    // Modifiers
    modifier onlyInitialized() {
        if (!isInitialized) revert ContractNotInitialized();
        _;
    }

    modifier onlyUser() {
        if (msg.sender != user) revert Unauthorized();
        _;
    }

    modifier validSessionId(bytes32 sessionId) {
        if (sessionId == bytes32(0)) revert InvalidSessionId();
        _;
    }

    /**
     * Initialize the user contract (called by factory). The second argument is kept for
     * compatibility with ContractFactory, but is otherwise ignored in this minimal contract.
     */
    function initialize(address _user, uint256 /* _subscriptionId */) external {
        require(!isInitialized, "Already initialized");
        require(_user != address(0), "Invalid user");

        user = _user;
        createdAt = block.timestamp;
        isInitialized = true;

        emit UserContractInitialized(_user, block.timestamp);
    }

    /**
     * Store an encrypted chat summary for a given sessionId.
     * Only the user can call this function.
     */
    function storeChatSummary(bytes32 sessionId, bytes calldata encryptedSummary)
        external
        onlyInitialized
        onlyUser
        validSessionId(sessionId)
    {
        chatSummaries[sessionId] = encryptedSummary;
        emit ChatSummaryStored(user, sessionId, block.timestamp);
    }
}
