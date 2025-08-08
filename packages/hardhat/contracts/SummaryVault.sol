// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * SummaryVault
 * - Stores chat summaries keyed by an ID
 * - Emits a public event with indexable metadata for The Graph
 * Note: The Oasis Sapphire runtime provides confidentiality for calldata/state
 * when transacting on Sapphire networks using Sapphire-aware clients.
 */
contract SummaryVault {
    event SummarySaved(address indexed user, string id, string title, uint256 timestamp);

    // Mapping from summary ID to summary content
    mapping(string => string) private idToSummary;

    /**
     * Save or update a summary
     * @param id     Client-defined identifier (e.g., "summary_2025_08_08_05_59")
     * @param content Full summary content (JSON string or free text)
     * @param title  Short title for indexing/display
     */
    function saveSummary(string calldata id, string calldata content, string calldata title) external {
        idToSummary[id] = content;
        emit SummarySaved(msg.sender, id, title, block.timestamp);
    }

    /**
     * Retrieve a previously saved summary by ID
     */
    function getSummary(string calldata id) external view returns (string memory) {
        return idToSummary[id];
    }
}


