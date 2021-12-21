pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaign;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaign.push(newCampaign);
    }

    function getDeployedCampaign() public view returns (address[]) {
        return deployedCampaign;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approverCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function Campaign(uint minimum, address _manager) public  {
        manager = _manager;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution);
        approvers[msg.sender] = true;
        approverCount++;
    }

    function createRequest(string _description, uint _value, address _recipient) public restricted {
        Request memory newRequest = Request({
            description: _description,
            value: _value,
            recipient: _recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public  {
        Request storage request = requests[index];
        require(approvers[msg.sender]);  // To check if the sender is a contributor or not
        require(!request.approvals[msg.sender]); // To check if the sender has voted before or not

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approvalCount > (approverCount /2));

        request.recipient.transfer(request.value);
        request.complete = true;
    }
}