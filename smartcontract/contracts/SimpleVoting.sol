// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleVoting {
    // Sự kiện
    event VoterRegistered(address voter);
    event VoterRenamed(address voter, string newName);
    event VoteCast(address voter, uint candidateId);
    event ElectionFinalized(uint winningCandidateId);
    event CandidateAdded(uint candidateId, string name, string info);

    // Dữ liệu
    struct Candidate {
        string name;
        string info;
        uint voteCount;
    }
    mapping(uint => Candidate) public candidates; // Mapping thay vì mảng
    uint public candidateCount;

    struct Voter {
        bool registered;
        bool voted;
        uint vote; // Lưu chỉ số ứng cử viên mà cử tri đã chọn
        string name;
    }
    mapping(address => Voter) public voters;

    // Khởi tạo
    constructor(string[] memory _candidateNames) {
        for (uint i = 0; i < _candidateNames.length; i++) {
            candidates[i] = Candidate(_candidateNames[i], "", 0);
            candidateCount++;
        }
    }

    // Đăng ký cử tri
    function registerVoter(string memory _name) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.registered, "Already registered");
        sender.registered = true;
        sender.name = _name;
        emit VoterRegistered(msg.sender);
    }

    // Thêm ứng cử viên mới
    function addCandidate(string memory _name, string memory _info) external {
        candidates[candidateCount] = Candidate(_name, _info, 0);
        emit CandidateAdded(candidateCount, _name, _info);
        candidateCount++;
    }

    function removeCandidate(uint candidateId) external {
        require(candidateId < candidateCount, "Invalid candidate ID");
        for (uint i = candidateId; i < candidateCount - 1; i++) {
            candidates[i] = candidates[i + 1];
        }
        delete candidates[candidateCount - 1];
        candidateCount--;
    }

    // Người tham gia bỏ phiếu cho ứng cử viên
    function vote(uint candidateId) external {
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
    function finalizeElection() external {
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
    function getCandidate(uint id) external view returns (string memory name, string memory info, uint voteCount) {
        require(id < candidateCount, "Invalid candidate ID");
        Candidate memory c = candidates[id];
        return (c.name, c.info, c.voteCount);
    }

    // Lấy thông tin phiếu bầu của cử tri
    function getVoterVote(address voter) external view returns (bool voted, uint candidateId) {
        Voter memory v = voters[voter];
        return (v.voted, v.vote);
    }

    // Kiểm tra trạng thái của cử tri
    function getVoterStatus(address voter) external view returns (bool registered, bool voted) {
        Voter memory v = voters[voter];
        return (v.registered, v.voted);
    }

    function renameVoter(address voter, string memory newName) external {
        require(voters[voter].registered, "Voter not registered");
        voters[voter].name = newName;
        emit VoterRenamed(voter, newName);
    }

    // Lấy danh sách cử tri và phiếu bầu của họ
    function getVoterList() external view returns (address[] memory, uint[] memory) {
        address[] memory voterAddresses = new address[](candidateCount);
        uint[] memory votes = new uint[](candidateCount);
        uint index = 0;
        for (uint i = 0; i < candidateCount; i++) {
            if (voters[voterAddresses[i]].registered) {
                voterAddresses[index] = voterAddresses[i];
                votes[index] = voters[voterAddresses[i]].vote;
                index++;
            }
        }
        return (voterAddresses, votes);
    }
}