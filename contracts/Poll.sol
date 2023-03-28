pragma solidity ^0.8.0;

contract Poll {
    // Poll question
    string public question;

    // Poll status
    bool public pollOpen;

    // Poll end time
    uint256 public endTime;

    // Vote counts
    uint256 public yesVotes;
    uint256 public noVotes;

    // Voter info
    mapping(address => bool) public hasVoted;

    // Event to notify when poll is closed
    event PollClosed();

    // Constructor function
    constructor(string memory _question) {
        question = _question;
        pollOpen = true;
        endTime = block.timestamp + 5 minutes;
    }

    // Function to vote "yes"
    function voteYes() public {
        require(pollOpen, "Poll is closed");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        yesVotes++;
    }

    // Function to vote "no"
    function voteNo() public {
        require(pollOpen, "Poll is closed");
        require(!hasVoted[msg.sender], "Already voted");
        hasVoted[msg.sender] = true;
        noVotes++;
    }

    // Function to close the poll
    function closePoll() public {
        require(pollOpen, "Poll is already closed");
        require(block.timestamp >= endTime, "Voting period is not over yet");
        pollOpen = false;
        emit PollClosed();
    }
}