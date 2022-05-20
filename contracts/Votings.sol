//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Votings {
    struct Campaign {
        uint256 startAt;
        uint256 founded;
        uint256 commonVoteCount;
        uint256 prize;
        bool ended;
        mapping(address => bool) voters;
        mapping(address => bool) candidates;
        mapping(address => uint256) voteCounter;
        mapping(address => uint256) prizeSum;
        address[] candidatesList;
        address[] winnersList;
    }

    address public owner;
    mapping(uint256 => Campaign) campaigns;
    uint256 public duration = 5;
    uint256 bid = 1 ether;
    uint256 public ownerBalance;
    uint256 public commissionPercent = 10;
    uint256 currentCampaignIndex;
    bool locked;

    event newCampaignCreated(uint256 indexed campaignId);
    event campaingnEnded(
        uint256 indexed campaignId,
        uint256 prize,
        address[] winnersList
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not an owner");
        _;
    }

    modifier noReentrancy() {
        require(!locked, "no reentrancy!");
        locked = true;
        _;
        locked = false;
    }

    function createCampaign(address[] memory _candidateList)
        external
        returns (uint256)
    {
        require(_candidateList.length > 0, "Add more candidates");
        Campaign storage c = campaigns[currentCampaignIndex];
        c.startAt = block.timestamp;

        for (uint256 i = 0; i < _candidateList.length; i++) {
            //addresses must not be duplicated
            if (!c.candidates[_candidateList[i]]) {
                c.candidates[_candidateList[i]] = true;
                c.candidatesList.push(_candidateList[i]);
            }
        }

        emit newCampaignCreated(currentCampaignIndex);
        return currentCampaignIndex++;
    }

    function stopCampaign(uint256 _index) external {
        require(
            (campaigns[_index].startAt + duration) <= block.timestamp,
            "Time is not up yet."
        );
        require(campaigns[_index].ended == false, "Voting already ended");
        Campaign storage c = campaigns[_index];

        c.ended = true;
        uint256 comission = (campaigns[_index].founded / 100) *
            commissionPercent;
        ownerBalance += comission;
        c.prize = c.founded - comission;
        // найти максимальное число голосов
        uint256 maxVoicesValue = getmaxVoicesValue(_index);
        //Всех кандидатов с максимальным числом голосов записать в winnersList
        for (uint256 i = 0; i < c.candidatesList.length; i++) {
            if (c.voteCounter[c.candidatesList[i]] == maxVoicesValue) {
                c.winnersList.push(c.candidatesList[i]);
            }
        }
        //каждому призёру из списка winnersList начислить приз (prize/N)
        for (uint256 i = 0; i < c.winnersList.length; i++) {
            c.prizeSum[c.winnersList[i]] = c.prize / c.winnersList.length;
        }
        emit campaingnEnded(_index, c.founded, c.winnersList);
    }

    function vote(uint256 _index, address _candidateAddress) external payable {
        Campaign storage c = campaigns[_index];
        require(c.startAt + duration > block.timestamp, "Voting time is up");
        require(c.candidates[_candidateAddress], "Unknown candidate");
        require(!c.voters[msg.sender], "You have already voted");
        require((msg.value == bid), "Wrong bid");
        c.voters[msg.sender] = true;
        c.founded += bid;
        c.voteCounter[_candidateAddress] += 1;
        c.commonVoteCount += 1;
    }

    function comissionWithdraw(uint256 _value) external onlyOwner {
        require(_value <= ownerBalance, "insufficient funds");
        ownerBalance -= _value;
        payable(owner).transfer(_value);
    }

    function prizeWithdraw(uint256 _campaignId) external noReentrancy {
        Campaign storage c = campaigns[_campaignId];
        require(c.prizeSum[msg.sender] > 0, "Nothing to withdraw");
        payable(msg.sender).transfer(c.prizeSum[msg.sender]);
        c.prizeSum[msg.sender] = 0;
    }

    function setComissionPercent(uint256 _newComissionPercent)
        external
        onlyOwner
    {
        commissionPercent = _newComissionPercent;
    }

    function setDuration(uint256 _newDuration) external onlyOwner {
        duration = _newDuration;
    }

    function setBid(uint256 _newBid) external onlyOwner {
        bid = _newBid;
    }

    function getmaxVoicesValue(uint256 _campaignId)
        private
        view
        returns (uint256)
    {
        Campaign storage c = campaigns[_campaignId];
        uint256 maxVal = c.voteCounter[c.candidatesList[0]];

        for (uint256 i = 1; i < c.candidatesList.length; i++) {
            if (c.voteCounter[c.candidatesList[i]] > maxVal) {
                maxVal = c.voteCounter[c.candidatesList[i]];
            }
        }

        return maxVal;
    }

    function getVotesCount(uint256 _campaignId)
        external
        view
        returns (uint256)
    {
        return campaigns[_campaignId].commonVoteCount;
    }

    function getComissionPercent() external view returns (uint256) {
        return commissionPercent;
    }

    function getDuration() external view returns (uint256) {
        return duration;
    }

    function getBid() external view returns (uint256) {
        return bid;
    }

    function getCampaignInformation(uint256 _campaignId)
        external
        view
        returns (
            bool,
            uint256,
            address[] memory,
            uint256,
            uint256
        )
    {
        Campaign storage c = campaigns[_campaignId];
        return (
            c.ended,
            c.startAt,
            c.candidatesList,
            c.commonVoteCount,
            c.founded
        );
    }

    function getVoteCounterOfCandidate(uint256 _id, address _candidate)
        external
        view
        returns (uint256)
    {
        return campaigns[_id].voteCounter[_candidate];
    }

    function getOwnerBalance() external view returns (uint256) {
        return ownerBalance;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
