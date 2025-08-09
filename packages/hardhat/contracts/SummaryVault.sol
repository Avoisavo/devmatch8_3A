// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";

/**
 * SummaryVault
 * - Stores chat summaries keyed by an ID
 * - Emits a public event with indexable metadata for The Graph
 * - Adds SIWE-based authorization to protect reads and updates by owner of each summary ID
 * Note: The Oasis Sapphire runtime provides confidentiality for calldata/state
 * when transacting on Sapphire networks using Sapphire-aware clients.
 */
contract SummaryVault is SiweAuth {
    event SummarySaved(address indexed user, string id, string title, uint256 timestamp);

    // Mapping from summary ID to summary content (private)
    mapping(string => string) private _idToSummary;
    // Mapping from summary ID to its owner (the first address that saved that id)
    mapping(string => address) private _idToOwner;

    constructor(string memory domain) SiweAuth(domain) {}

    // Modifier that enforces that the caller is the owner of the id, either via msg.sender or SIWE token
    modifier onlyIdOwner(string memory id, bytes memory token) {
        address owner_ = _idToOwner[id];
        require(owner_ != address(0), "Unknown id");
        address authSender = authMsgSender(token);
        require(msg.sender == owner_ || authSender == owner_, "Not the owner");
        _;
    }

    /**
     * Save or update a summary
     * @param id     Client-defined identifier (e.g., "summary_2025_08_08_05_59")
     * @param content Full summary content (JSON string or free text)
     * @param title  Short title for indexing/display
     */
    function saveSummary(string calldata id, string calldata content, string calldata title) external {
        // Establish owner on first save, then enforce ownership on subsequent updates
        address currentOwner = _idToOwner[id];
        if (currentOwner == address(0)) {
            _idToOwner[id] = msg.sender;
        } else {
            require(msg.sender == currentOwner, "Not the owner");
        }
        _idToSummary[id] = content;
        emit SummarySaved(msg.sender, id, title, block.timestamp);
    }

    /**
     * Save or update a summary with SIWE token authorization
     */
    function saveSummaryAuth(string calldata id, string calldata content, string calldata title, bytes calldata token) external {
        address currentOwner = _idToOwner[id];
        if (currentOwner == address(0)) {
            // First save: allow either tx-sender or SIWE-authenticated sender to become owner
            address authSender = authMsgSender(token);
            address newOwner = msg.sender;
            if (authSender != address(0)) {
                newOwner = authSender;
            }
            _idToOwner[id] = newOwner;
        } else {
            address authSender = authMsgSender(token);
            require(msg.sender == currentOwner || authSender == currentOwner, "Not the owner");
        }
        _idToSummary[id] = content;
        emit SummarySaved(msg.sender, id, title, block.timestamp);
    }

    /**
     * Retrieve a previously saved summary by ID, requiring SIWE token or owner caller
     */
    function getSummaryAuth(string calldata id, bytes calldata token) external view onlyIdOwner(id, token) returns (string memory) {
        return _idToSummary[id];
    }

    /**
     * Backward-compatible getter (not recommended). Returns empty string if caller is not the owner.
     * Note: eth_call can spoof msg.sender, so do not rely on this for strong privacy. Use getSummaryAuth instead.
     */
    function getSummary(string calldata id) external view returns (string memory) {
        return msg.sender == _idToOwner[id] ? _idToSummary[id] : "";
    }

    /**
     * Returns the owner of a given summary id
     */
    function ownerOf(string calldata id) external view returns (address) {
        return _idToOwner[id];
    }
}


