//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
 * User Contract for storing encrypted chat data
 * Each user gets their own contract for privacy
 * @author BuidlGuidl
 */
contract UserContract is Ownable {
    constructor() Ownable(msg.sender) {}
    // User data
    address public user;
    uint256 public subscriptionId;
    uint256 public createdAt;
    bool public isInitialized;
    
    // Chat session management
    struct ChatSession {
        bytes32 sessionId;
        uint256 createdAt;
        uint256 lastActivity;
        bool isActive;
        uint256 messageCount;
    }
    
    // Chat message structure
    struct ChatMessage {
        bytes encryptedUserMessage;
        bytes encryptedAIResponse;
        uint256 timestamp;
        uint256 messageOrder;
    }
    
    // Chat summary structure
    struct ChatSummary {
        bytes32 sessionId;
        bytes encryptedSummary;
        uint256 createdAt;
        uint256 messageCount;
    }
    
    // Storage mappings
    mapping(bytes32 => ChatSession) public chatSessions;
    mapping(bytes32 => ChatMessage[]) public chatMessages;
    mapping(bytes32 => ChatSummary) public chatSummaries;
    mapping(bytes32 => uint256) public sessionMessageCount;
    bytes32[] public userSessionIds;
    
    // TEE contract access (for AI processing)
    address public teeContract;
    
    // Events
    event ChatSessionCreated(address indexed user, bytes32 indexed sessionId, uint256 timestamp);
    event ChatMessageStored(address indexed user, bytes32 indexed sessionId, uint256 messageOrder, uint256 timestamp);
    event ChatSessionClosed(address indexed user, bytes32 indexed sessionId, uint256 timestamp);
    event ChatSummaryStored(address indexed user, bytes32 indexed sessionId, uint256 timestamp);
    event TEEContractUpdated(address indexed oldTEE, address indexed newTEE);
    event UserContractInitialized(address indexed user, uint256 subscriptionId, uint256 timestamp);
    
    // Errors
    error ContractNotInitialized();
    error SessionNotFound();
    error SessionAlreadyExists();
    error UnauthorizedAccess();
    error InvalidSessionId();
    error InvalidMessageOrder();
    
    // Modifiers
    modifier onlyInitialized() {
        if (!isInitialized) {
            revert ContractNotInitialized();
        }
        _;
    }
    
    modifier onlyUser() {
        if (msg.sender != user) {
            revert UnauthorizedAccess();
        }
        _;
    }
    
    modifier onlyTEE() {
        if (msg.sender != teeContract) {
            revert UnauthorizedAccess();
        }
        _;
    }
    
    modifier validSessionId(bytes32 sessionId) {
        if (sessionId == bytes32(0)) {
            revert InvalidSessionId();
        }
        _;
    }
    
    /**
     * Initialize the user contract
     * Can only be called once by the factory
     */
    function initialize(address _user, uint256 _subscriptionId) external {
        require(!isInitialized, "Already initialized");
        require(_user != address(0), "Invalid user address");
        
        user = _user;
        subscriptionId = _subscriptionId;
        createdAt = block.timestamp;
        isInitialized = true;
        
        emit UserContractInitialized(_user, _subscriptionId, block.timestamp);
    }
    
    /**
     * Create a new chat session
     * @return sessionId The new session ID
     */
    function createNewSession() external onlyUser onlyInitialized returns (bytes32) {
        uint256 sessionCounter = userSessionIds.length;
        bytes32 sessionId = keccak256(abi.encodePacked(user, block.timestamp, sessionCounter));
        
        // Ensure unique session ID
        while (chatSessions[sessionId].createdAt != 0) {
            sessionCounter++;
            sessionId = keccak256(abi.encodePacked(user, block.timestamp, sessionCounter));
        }
        
        ChatSession memory newSession = ChatSession({
            sessionId: sessionId,
            createdAt: block.timestamp,
            lastActivity: block.timestamp,
            isActive: true,
            messageCount: 0
        });
        
        chatSessions[sessionId] = newSession;
        userSessionIds.push(sessionId);
        sessionMessageCount[sessionId] = 0;
        
        emit ChatSessionCreated(user, sessionId, block.timestamp);
        
        return sessionId;
    }
    
    /**
     * Store a chat message in a session
     * @param sessionId The session ID
     * @param encryptedUserMessage Encrypted user message
     * @param encryptedAIResponse Encrypted AI response
     */
    function storeChatMessage(
        bytes32 sessionId,
        bytes calldata encryptedUserMessage,
        bytes calldata encryptedAIResponse
    ) external onlyUser onlyInitialized validSessionId(sessionId) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        require(chatSessions[sessionId].isActive, "Session is closed");
        
        uint256 messageOrder = sessionMessageCount[sessionId];
        
        ChatMessage memory newMessage = ChatMessage({
            encryptedUserMessage: encryptedUserMessage,
            encryptedAIResponse: encryptedAIResponse,
            timestamp: block.timestamp,
            messageOrder: messageOrder
        });
        
        chatMessages[sessionId].push(newMessage);
        sessionMessageCount[sessionId]++;
        chatSessions[sessionId].lastActivity = block.timestamp;
        chatSessions[sessionId].messageCount++;
        
        emit ChatMessageStored(user, sessionId, messageOrder, block.timestamp);
    }
    
    /**
     * Store a chat summary (called by TEE after processing)
     * @param sessionId The session ID
     * @param encryptedSummary Encrypted summary from AI
     */
    function storeChatSummary(
        bytes32 sessionId,
        bytes calldata encryptedSummary
    ) external onlyTEE onlyInitialized validSessionId(sessionId) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        
        ChatSummary memory summary = ChatSummary({
            sessionId: sessionId,
            encryptedSummary: encryptedSummary,
            createdAt: block.timestamp,
            messageCount: chatSessions[sessionId].messageCount
        });
        
        chatSummaries[sessionId] = summary;
        
        emit ChatSummaryStored(user, sessionId, block.timestamp);
    }
    
    /**
     * Get chat history for a session
     * @param sessionId The session ID
     * @return Array of chat messages
     */
    function getChatHistory(bytes32 sessionId) external view onlyUser onlyInitialized validSessionId(sessionId) returns (ChatMessage[] memory) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        return chatMessages[sessionId];
    }
    
    /**
     * Get chat summary for a session
     * @param sessionId The session ID
     * @return Chat summary
     */
    function getChatSummary(bytes32 sessionId) external view onlyUser onlyInitialized validSessionId(sessionId) returns (ChatSummary memory) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        return chatSummaries[sessionId];
    }
    
    /**
     * Get session information
     * @param sessionId The session ID
     * @return Session information
     */
    function getSessionInfo(bytes32 sessionId) external view onlyUser onlyInitialized validSessionId(sessionId) returns (ChatSession memory) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        return chatSessions[sessionId];
    }
    
    /**
     * Get all active sessions for the user
     * @return Array of active session IDs
     */
    function getActiveSessions() external view onlyUser onlyInitialized returns (bytes32[] memory) {
        bytes32[] memory activeSessions = new bytes32[](userSessionIds.length);
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < userSessionIds.length; i++) {
            bytes32 sessionId = userSessionIds[i];
            if (chatSessions[sessionId].isActive) {
                activeSessions[activeCount] = sessionId;
                activeCount++;
            }
        }
        
        // Resize array to actual count
        bytes32[] memory result = new bytes32[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            result[i] = activeSessions[i];
        }
        
        return result;
    }
    
    /**
     * Close a chat session
     * @param sessionId The session ID to close
     */
    function closeSession(bytes32 sessionId) external onlyUser onlyInitialized validSessionId(sessionId) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        require(chatSessions[sessionId].isActive, "Session already closed");
        
        chatSessions[sessionId].isActive = false;
        chatSessions[sessionId].lastActivity = block.timestamp;
        
        emit ChatSessionClosed(user, sessionId, block.timestamp);
    }
    
    /**
     * Delete a session and all its data
     * @param sessionId The session ID to delete
     */
    function deleteSession(bytes32 sessionId) external onlyUser onlyInitialized validSessionId(sessionId) {
        require(chatSessions[sessionId].createdAt != 0, "Session not found");
        
        // Remove from userSessionIds array
        for (uint256 i = 0; i < userSessionIds.length; i++) {
            if (userSessionIds[i] == sessionId) {
                userSessionIds[i] = userSessionIds[userSessionIds.length - 1];
                userSessionIds.pop();
                break;
            }
        }
        
        // Clear session data
        delete chatSessions[sessionId];
        delete chatMessages[sessionId];
        delete chatSummaries[sessionId];
        delete sessionMessageCount[sessionId];
    }
    
    /**
     * Set TEE contract address (for AI processing)
     * @param _teeContract TEE contract address
     */
    function setTEEContract(address _teeContract) external onlyOwner {
        require(_teeContract != address(0), "Invalid TEE contract address");
        address oldTEE = teeContract;
        teeContract = _teeContract;
        
        emit TEEContractUpdated(oldTEE, _teeContract);
    }
    
    /**
     * Get user contract information
     * @return _user User address
     * @return _subscriptionId Subscription ID
     * @return _createdAt Contract creation timestamp
     * @return _totalSessions Total number of sessions
     */
    function getUserInfo() external view onlyUser onlyInitialized returns (
        address _user,
        uint256 _subscriptionId,
        uint256 _createdAt,
        uint256 _totalSessions
    ) {
        return (user, subscriptionId, createdAt, userSessionIds.length);
    }
    
    /**
     * Get total message count for a session
     * @param sessionId The session ID
     * @return Message count
     */
    function getSessionMessageCount(bytes32 sessionId) external view onlyUser onlyInitialized validSessionId(sessionId) returns (uint256) {
        return sessionMessageCount[sessionId];
    }
    
    /**
     * Get all session IDs for the user
     * @return Array of session IDs
     */
    function getAllSessionIds() external view onlyUser onlyInitialized returns (bytes32[] memory) {
        return userSessionIds;
    }
} 