// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    // Sự kiện
    event VoterRegistered(address voter);
    event VoteCast(address voter, uint candidateId);
    event ElectionFinalized(uint winningCandidateId);

    // Quyền hạn
    address public owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // Giai đoạn
    enum Phase { Registration, Voting, Finalized }
    Phase public phase;
    uint public votingEnd;

    // Dữ liệu
    struct Candidate {
        string name;
        uint voteCount;
    }
    mapping(uint => Candidate) public candidates; // Mapping thay vì mảng
    uint public candidateCount;

    struct Voter {
        bool registered;
        bool voted;
        uint vote; // Lưu chỉ số ứng cử viên mà cử tri đã chọn
    }
    mapping(address => Voter) public voters;

    // Khởi tạo
    constructor(string[] memory _candidateNames, uint _votingDuration) {
        owner = msg.sender;
        phase = Phase.Registration;
        votingEnd = block.timestamp + (_votingDuration * 1 minutes);

        for (uint i = 0; i < _candidateNames.length; i++) {
            candidates[i] = Candidate(_candidateNames[i], 0);
            candidateCount++;
        }
    }

    // Đăng ký cử tri
    function registerVoter() external {
        require(phase == Phase.Registration, "Not in Registration phase");
        Voter storage sender = voters[msg.sender];
        require(!sender.registered, "Already registered");
        sender.registered = true;
        emit VoterRegistered(msg.sender);
    }

    // Bắt đầu giai đoạn bỏ phiếu
    function startVotingPhase() external onlyOwner {
        require(phase == Phase.Registration, "Not in Registration phase");
        phase = Phase.Voting;
    }

    // Người tham gia bỏ phiếu cho ứng cử viên
    function vote(uint candidateId) external {
        require(phase == Phase.Voting, "Not in Voting phase");
        require(block.timestamp < votingEnd, "Voting period ended");
        Voter storage sender = voters[msg.sender];
        require(sender.registered, "You are not registered");
        require(!sender.voted, "You have already voted");
        require(candidateId < candidateCount, "Invalid candidate ID");

        // Ghi nhận phiếu bầu
        sender.voted = true;
        sender.vote = candidateId;
        candidates[candidateId].voteCount++;

        emit VoteCast(msg.sender, candidateId);
    }

    // Kết thúc bầu cử
    function finalizeElection() external onlyOwner {
        require(phase == Phase.Voting, "Not in Voting phase");
        require(block.timestamp >= votingEnd, "Voting period not ended");
        phase = Phase.Finalized;

        uint winnerId = determineWinner();
        emit ElectionFinalized(winnerId);
    }

    // Xác định người thắng
    function determineWinner() internal view returns (uint) {
        uint highestVotes = 0;
        uint winnerId = 0;
        for (uint i = 0; i < candidateCount; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winnerId = i;
            }
        }
        return winnerId;
    }

    // Lấy thông tin ứng cử viên
    function getCandidate(uint id) external view returns (string memory name, uint voteCount) {
        require(id < candidateCount, "Invalid candidate ID");
        Candidate memory c = candidates[id];
        return (c.name, c.voteCount);
    }

    // Lấy thông tin phiếu bầu của cử tri
    function getVoterVote(address voter) external view returns (bool voted, uint candidateId) {
        Voter memory v = voters[voter];
        return (v.voted, v.vote);
    }
}