// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

contract MnimizedCommitmentScheme {
    bytes32 public commitment;

    function commit(bytes32 _commitment) public payable {
        commitment = _commitment;
    }

    function reveal(uint256 _choice, bytes32 blindingFactor) public {
        require(
            keccak256(abi.encodePacked(msg.sender, _choice, blindingFactor)) ==
                commitment,
            "invalid hash"
        );
    }

    function getEncodePacked(
        address _sender,
        uint256 _choice,
        bytes32 blindingFactor
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_sender, _choice, blindingFactor));
    }
}
