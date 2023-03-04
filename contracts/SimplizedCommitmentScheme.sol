// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "hardhat/console.sol";

contract SimplizedCommitmentScheme {
    enum Choice {
        None,
        Rock,
        Scissors,
        Paper
    }

    enum Stage {
        FirstCommit,
        SecondCommit,
        FirstReveal,
        SecondReveal,
        Judgement
    }

    enum Winner {
        None,
        First,
        Second
    }

    struct CommitChoice {
        address playerAddress;
        Choice choice;
        bytes32 commitment;
    }

    // Parameters
    uint40 public revealSpan;

    // State vars
    CommitChoice[2] public players;
    Stage public stage = Stage.FirstCommit;
    uint40 public revealDeadline;
    Winner public winner;

    constructor(uint40 _revealSpan) {
        revealSpan = _revealSpan;
    }

    function commit(bytes32 _commitment) public payable {
        //valication check
        uint256 playerIndex;
        if (stage == Stage.FirstCommit) {
            playerIndex = 0;
            stage = Stage.SecondCommit;
        } else if (stage == Stage.SecondCommit) {
            playerIndex = 1;
            stage = Stage.FirstReveal;
        } else {
            revert("both players have already played");
        }

        // Store the commitment
        players[playerIndex] = CommitChoice(
            msg.sender,
            Choice.None,
            _commitment
        );
    }

    function reveal(Choice _choice, bytes32 _blindingFactor) public {
        //valication check
        require(
            _choice == Choice.Rock ||
                _choice == Choice.Paper ||
                _choice == Choice.Scissors,
            "invalid choice"
        );

        if (stage == Stage.FirstReveal) {
            revealDeadline = uint40(block.timestamp) + revealSpan;
            stage = Stage.SecondReveal;
        } else if (stage == Stage.SecondReveal) {
            stage = Stage.Judgement;
        } else {
            revert("not at reveal stage");
        }

        // Find the player index
        uint256 playerIndex;
        if (players[0].playerAddress == msg.sender) {
            playerIndex = 0;
        } else if (players[1].playerAddress == msg.sender) {
            playerIndex = 1;
        } else {
            revert("unknown player");
        }

        CommitChoice storage commitChoice = players[playerIndex];

        require(
            keccak256(abi.encodePacked(msg.sender, _choice, _blindingFactor)) ==
                commitChoice.commitment,
            "invalid hash"
        );

        // Update choice
        commitChoice.choice = _choice;
    }

    function judgement() external {
        require(
            stage == Stage.Judgement ||
                (stage == Stage.SecondReveal && revealDeadline <= block.number),
            "cannot yet distribute"
        );
        CommitChoice memory player1Choice = players[0];
        CommitChoice memory player2Choice = players[1];

        console.log(uint256(player1Choice.choice), "player1Choice.choice");
        console.log(uint256(player2Choice.choice), "player2Choice.choice");

        if (player1Choice.choice == Choice.None) {
            winner = Winner.Second;
        } else if (player2Choice.choice == Choice.None) {
            winner = Winner.First;
        } else if (player1Choice.choice == Choice.Rock) {
            if (player2Choice.choice == Choice.Paper) {
                winner = Winner.Second;
            } else if (player2Choice.choice == Choice.Scissors) {
                winner = Winner.First;
            }
        } else if (player1Choice.choice == Choice.Paper) {
            if (player2Choice.choice == Choice.Rock) {
                winner = Winner.First;
            } else if (player2Choice.choice == Choice.Scissors) {
                winner = Winner.Second;
            }
        } else if (player1Choice.choice == Choice.Scissors) {
            if (player2Choice.choice == Choice.Rock) {
                winner = Winner.Second;
            } else if (player2Choice.choice == Choice.Paper) {
                winner = Winner.First;
            }
        } else {
            revert("invalid choice");
        }
    }

    function getEncodePacked(
        address _sender,
        Choice _choice,
        bytes32 _blindingFactor
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_sender, _choice, _blindingFactor));
    }
}
