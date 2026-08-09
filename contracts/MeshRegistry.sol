// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MeshRegistry
/// @notice On-chain registry for the MESHGRID decentralized data & compute
///         network. Tracks worker nodes, compute jobs, and storage commitments.
///         Deployed to the custom chain (chainId 65690).
contract MeshRegistry {
    // --- Types -------------------------------------------------------------

    enum JobStatus { Queued, Scheduling, Running, Verifying, Completed, Failed }
    enum CommitmentStatus { Committed, Replicating, Sealed, Challenged }

    struct Node {
        address operator;
        string  region;
        uint8   role;          // 0 compute, 1 storage, 2 hybrid, 3 validator
        uint32  cpuCores;
        uint32  ramGb;
        uint32  storageTb;
        uint256 stakedTokens;
        uint64  registeredAt;
        bool    active;
    }

    struct Job {
        address submitter;
        string  name;
        string  image;
        uint32  cpuReq;
        uint32  ramReqGb;
        uint256 assignedNode;  // index+1 into nodes, 0 = unassigned
        JobStatus status;
        uint8   progress;      // 0-100
        uint256 costTokens;
        uint64  submittedAt;
    }

    struct Commitment {
        address owner;
        string  cid;
        string  name;
        uint256 sizeGb;
        uint8   replicationFactor;
        uint8   replicasHealthy;
        CommitmentStatus status;
        uint64  committedAt;
    }

    // --- Storage -----------------------------------------------------------

    address public immutable admin;

    Node[] public nodes;
    Job[] public jobs;
    Commitment[] public commitments;

    mapping(address => uint256) public nodeOf; // operator => index+1

    // --- Events ------------------------------------------------------------

    event NodeRegistered(uint256 indexed id, address indexed operator, uint8 role);
    event NodeStaked(uint256 indexed id, uint256 stakedTokens);
    event NodeDeactivated(uint256 indexed id);
    event JobSubmitted(uint256 indexed id, address indexed submitter, string name);
    event JobStatusChanged(uint256 indexed id, JobStatus status, uint8 progress);
    event CommitmentCreated(uint256 indexed id, address indexed owner, string cid);
    event CommitmentUpdated(uint256 indexed id, CommitmentStatus status, uint8 replicasHealthy);

    constructor() {
        admin = msg.sender;
    }

    // --- Nodes -------------------------------------------------------------

    function registerNode(
        string calldata region,
        uint8 role,
        uint32 cpuCores,
        uint32 ramGb,
        uint32 storageTb
    ) external returns (uint256 id) {
        require(nodeOf[msg.sender] == 0, "node exists");
        nodes.push(
            Node({
                operator: msg.sender,
                region: region,
                role: role,
                cpuCores: cpuCores,
                ramGb: ramGb,
                storageTb: storageTb,
                stakedTokens: 0,
                registeredAt: uint64(block.timestamp),
                active: true
            })
        );
        id = nodes.length;
        nodeOf[msg.sender] = id;
        emit NodeRegistered(id, msg.sender, role);
    }

    /// @notice Stake by sending native MESH along with the call.
    function stake() external payable {
        uint256 id = nodeOf[msg.sender];
        require(id != 0, "no node");
        nodes[id - 1].stakedTokens += msg.value;
        emit NodeStaked(id, nodes[id - 1].stakedTokens);
    }

    function deactivateNode() external {
        uint256 id = nodeOf[msg.sender];
        require(id != 0, "no node");
        nodes[id - 1].active = false;
        emit NodeDeactivated(id);
    }

    // --- Jobs --------------------------------------------------------------

    function submitJob(
        string calldata name,
        string calldata image,
        uint32 cpuReq,
        uint32 ramReqGb,
        uint256 costTokens
    ) external returns (uint256 id) {
        jobs.push(
            Job({
                submitter: msg.sender,
                name: name,
                image: image,
                cpuReq: cpuReq,
                ramReqGb: ramReqGb,
                assignedNode: 0,
                status: JobStatus.Queued,
                progress: 0,
                costTokens: costTokens,
                submittedAt: uint64(block.timestamp)
            })
        );
        id = jobs.length;
        emit JobSubmitted(id, msg.sender, name);
    }

    function updateJob(uint256 id, JobStatus status, uint8 progress, uint256 assignedNode) external {
        require(id != 0 && id <= jobs.length, "bad id");
        Job storage j = jobs[id - 1];
        j.status = status;
        j.progress = progress;
        j.assignedNode = assignedNode;
        emit JobStatusChanged(id, status, progress);
    }

    // --- Storage commitments ----------------------------------------------

    function createCommitment(
        string calldata cid,
        string calldata name,
        uint256 sizeGb,
        uint8 replicationFactor
    ) external returns (uint256 id) {
        commitments.push(
            Commitment({
                owner: msg.sender,
                cid: cid,
                name: name,
                sizeGb: sizeGb,
                replicationFactor: replicationFactor,
                replicasHealthy: 0,
                status: CommitmentStatus.Committed,
                committedAt: uint64(block.timestamp)
            })
        );
        id = commitments.length;
        emit CommitmentCreated(id, msg.sender, cid);
    }

    function updateCommitment(uint256 id, CommitmentStatus status, uint8 replicasHealthy) external {
        require(id != 0 && id <= commitments.length, "bad id");
        Commitment storage c = commitments[id - 1];
        c.status = status;
        c.replicasHealthy = replicasHealthy;
        emit CommitmentUpdated(id, status, replicasHealthy);
    }

    // --- Views -------------------------------------------------------------

    function counts() external view returns (uint256 nodeCount, uint256 jobCount, uint256 commitmentCount) {
        return (nodes.length, jobs.length, commitments.length);
    }

    function getNodes() external view returns (Node[] memory) {
        return nodes;
    }

    function getJobs() external view returns (Job[] memory) {
        return jobs;
    }

    function getCommitments() external view returns (Commitment[] memory) {
        return commitments;
    }
}
