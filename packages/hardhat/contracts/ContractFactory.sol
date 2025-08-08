//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

/**
 * Contract Factory that creates individual user contracts for mental health AI assistant
 * Uses minimal proxy pattern for gas efficiency
 * @author BuidlGuidl
 */
contract ContractFactory is Ownable {
    // Core addresses
    address public subscriptionContract;
    address public userContractTemplate;
    
    // User contract registry
    mapping(address => address) public userContracts; // user => contract
    mapping(address => address) public contractOwners; // contract => user
    mapping(address => bool) public isUserContract; // contract => isUserContract
    
    // Statistics
    uint256 public totalUserContracts;
    uint256 public factoryVersion = 1;
    
    // Events
    event UserContractCreated(address indexed user, address indexed userContract, uint256 subscriptionId, uint256 timestamp);
    event SubscriptionContractUpdated(address indexed oldContract, address indexed newContract);
    event UserContractTemplateUpdated(address indexed oldTemplate, address indexed newTemplate);
    event FactoryVersionUpdated(uint256 oldVersion, uint256 newVersion);
    
    // Errors
    error UserAlreadyHasContract();
    error InvalidUserAddress();
    error InvalidSubscriptionContract();
    error InvalidTemplateAddress();
    error ContractCreationFailed();
    error UnauthorizedCaller();
    
    // Modifiers
    modifier onlySubscriptionContract() {
        if (msg.sender != subscriptionContract) {
            revert UnauthorizedCaller();
        }
        _;
    }
    
    modifier validAddress(address _address) {
        if (_address == address(0)) {
            revert InvalidUserAddress();
        }
        _;
    }
    
    /**
     * Constructor
     * @param _owner Owner of the factory contract
     * @param _userContractTemplate Address of the user contract template
     */
    constructor(address _owner, address _userContractTemplate) Ownable(_owner) {
        if (_userContractTemplate == address(0)) {
            revert InvalidTemplateAddress();
        }
        userContractTemplate = _userContractTemplate;
        console.log("ContractFactory deployed by:", _owner);
        console.log("User contract template:", _userContractTemplate);
    }
    
    /**
     * Create a new user contract for a user
     * Only callable by subscription contract
     * @param user Address of the user
     * @param subscriptionId Subscription ID from subscription contract
     * @return Address of the created user contract
     */
    function createUserContract(address user, uint256 subscriptionId) 
        external 
        onlySubscriptionContract 
        validAddress(user) 
        returns (address) 
    {
        // Check if user already has a contract
        address existingContract = userContracts[user];
        if (existingContract != address(0)) {
            console.log("User already has contract, returning existing:", existingContract);
            return existingContract; // Return existing contract instead of reverting
        }
        
        // Clone the user contract template
        address userContract = Clones.clone(userContractTemplate);
        
        // Validate contract creation
        if (userContract == address(0)) {
            revert ContractCreationFailed();
        }
        
        // Initialize the user contract
        UserContract(userContract).initialize(user, subscriptionId);
        
        // Update registry
        userContracts[user] = userContract;
        contractOwners[userContract] = user;
        isUserContract[userContract] = true;
        totalUserContracts++;
        
        console.log("Created NEW user contract for:", user);
        console.log("Contract address:", userContract);
        console.log("Subscription ID:", subscriptionId);
        
        emit UserContractCreated(user, userContract, subscriptionId, block.timestamp);
        
        return userContract;
    }
    
    /**
     * Get user contract address
     * @param user Address of the user
     * @return Address of the user's contract
     */
    function getUserContract(address user) external view returns (address) {
        return userContracts[user];
    }
    
    /**
     * Check if address is a user contract
     * @param contractAddress Address to check
     * @return True if it's a user contract
     */
    function checkIsUserContract(address contractAddress) external view returns (bool) {
        return isUserContract[contractAddress];
    }
    
    /**
     * Get total number of user contracts created
     * @return Total number of user contracts
     */
    function getTotalUserContracts() external view returns (uint256) {
        return totalUserContracts;
    }
    
    /**
     * Set subscription contract address
     * Only callable by owner
     * @param _subscriptionContract Address of the subscription contract
     */
    function setSubscriptionContract(address _subscriptionContract) external onlyOwner validAddress(_subscriptionContract) {
        address oldContract = subscriptionContract;
        subscriptionContract = _subscriptionContract;
        
        console.log("Updated subscription contract from:", oldContract, "to:", _subscriptionContract);
        emit SubscriptionContractUpdated(oldContract, _subscriptionContract);
    }
    
    /**
     * Set user contract template address
     * Only callable by owner
     * @param _template Address of the user contract template
     */
    function setUserContractTemplate(address _template) external onlyOwner validAddress(_template) {
        address oldTemplate = userContractTemplate;
        userContractTemplate = _template;
        
        console.log("Updated user contract template from:", oldTemplate, "to:", _template);
        emit UserContractTemplateUpdated(oldTemplate, _template);
    }
    
    /**
     * Upgrade factory version
     * Only callable by owner
     * @param _newVersion New factory version
     */
    function upgradeFactoryVersion(uint256 _newVersion) external onlyOwner {
        uint256 oldVersion = factoryVersion;
        factoryVersion = _newVersion;
        
        console.log("Upgraded factory version from:", oldVersion, "to:", _newVersion);
        emit FactoryVersionUpdated(oldVersion, _newVersion);
    }
    
    /**
     * Get factory information
     * @return _subscriptionContract Subscription contract address
     * @return _userContractTemplate User contract template address
     * @return _totalUserContracts Total number of user contracts
     * @return _factoryVersion Factory version
     */
    function getFactoryInfo() external view returns (
        address _subscriptionContract,
        address _userContractTemplate,
        uint256 _totalUserContracts,
        uint256 _factoryVersion
    ) {
        return (subscriptionContract, userContractTemplate, totalUserContracts, factoryVersion);
    }
}

/**
 * Interface for UserContract to enable initialization
 */
interface UserContract {
    function initialize(address user, uint256 subscriptionId) external;
} 