// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract CampaignFactory {
    Campaign[] public campaigns;

    function createCampaign(uint256 minimum) public {
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        campaigns.push(newCampaign);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint256 value;
        address payable recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint256 public minimumContribution;

    mapping(address => bool) public approvers;
    mapping(uint256 => Request) public requests;

    uint256 public approversCount;
    uint256 public requestsCount;
    uint256 requestIndex;

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager may access!");
        _;
    }

    constructor(uint256 minimum, address creator) {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(
            msg.value > minimumContribution,
            "Minimum contribution required!"
        );

        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(
        string memory description,
        uint256 value,
        address payable recipient
    ) public onlyManager {
        Request storage r = requests[requestIndex++];

        r.description = description;
        r.recipient = recipient;
        r.value = value;
        r.complete = false;
        r.approvalCount = 0;

        requestsCount++;
    }

    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 index) public onlyManager {
        Request storage r = requests[index];

        require(r.approvalCount > (approversCount / 2));
        require(!r.complete);

        r.recipient.transfer(r.value);
        r.complete = true;
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            minimumContribution,
            address(this).balance,
            requestsCount,
            approversCount,
            manager
        );
    }

    function getRequestsCount() public view returns (uint256) {
        return requestsCount;
    }
}
