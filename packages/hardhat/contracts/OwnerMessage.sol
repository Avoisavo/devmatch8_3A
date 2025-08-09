// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SiweAuth} from "@oasisprotocol/sapphire-contracts/contracts/auth/SiweAuth.sol";
import "hardhat/console.sol";

contract OwnerMessage is SiweAuth {
    address private _owner;
    string private _message;

    modifier onlyOwner(bytes memory token) {
        if (msg.sender != _owner && authMsgSender(token) != _owner) {
            revert("Not the owner");
        }
        _;
    }

    constructor(string memory initialMessage, string memory domain, address customOwner) SiweAuth(domain) {
        _owner = customOwner != address(0) ? customOwner : msg.sender;
        _message = initialMessage;
        console.log("OwnerMessage deployed by:", msg.sender);
        console.log("Contract owner set to:", _owner);
        console.log("Initial message:", initialMessage);
        console.log("Domain:", domain);
    }

    function getMessage(bytes memory token) external view onlyOwner(token) returns (string memory) {
        console.log("getMessage called by:", msg.sender);
        console.log("Token length:", token.length);
        return _message;
    }

    function setMessage(string calldata newMessage, bytes memory token) external onlyOwner(token) {
        console.log("setMessage called by:", msg.sender);
        console.log("New message:", newMessage);
        _message = newMessage;
    }

    function owner() external view returns (address) {
        return _owner;
    }
}
