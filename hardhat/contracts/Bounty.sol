// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./ICircuitVerifier.sol";
import "./IEncryptionVerifier.sol";

contract Bounty is Initializable, OwnableUpgradeable {
    uint public completedStep;
    IEncryptionVerifier public encryptionVerifier;

    // variables set by bounty provier at Tx 1 (constructor)
    string public name;
    string public description;
    bytes[] public dataCIDs;
    uint[] public labels;
    uint public accuracyThreshold; // in percentage
    // reward amount is not stored, use contract balance instead

    // variables set by bounty hunter at Tx 2
    address public bountyHunter;
    bytes public zkeyCID;
    bytes public circomCID;
    bytes public verifierCID;
    ICircuitVerifier public verifier;
    uint[2] public a;
    uint[2][2] public b;
    uint[2] public c;
    uint public modelHash;

    // variables set by bounty provider at Tx 3
    bool public isComplete;
    uint[2] public publicKeys;

    // variables set by bounty hunter at Tx 4
    uint[1005] public input;

    uint8 public constant CID_VERSION = 1;
    uint8 public constant CID_CODEC = 0x55; // for raw buffer
    uint8 public constant CID_HASH = 0x12; // for sha256
    uint8 public constant CID_LENGTH = 32; // for sha256

    // ! current design only allows one bounty hunter to submit proof
    // TODO: allow multiple bounty hunters to submit proof

    event BountyUpdated(uint step);

    /*
        Tx 1
        * take owner address from factory
        * set bounty details
        * receive native tokens as bounty reward
    */
    function initialize(
        address _owner,
        string memory _name,
        string memory _description,
        bytes[] memory _dataCIDs,
        uint[] memory _labels,
        uint _accuracyThreshold,
        address _encryptionVerifier
    ) public payable initializer {
        require(msg.value > 0, "Bounty reward must be greater than 0");
        // length of dataCIDs and labels should be the same
        require(
            _dataCIDs.length == _labels.length,
            "Invalid dataCIDs or labels length"
        );
        __Ownable_init();
        transferOwnership(_owner);
        name = _name;
        description = _description;
        dataCIDs = _dataCIDs;
        labels = _labels;
        accuracyThreshold = _accuracyThreshold;
        encryptionVerifier = IEncryptionVerifier(_encryptionVerifier);

        completedStep = 1;
    }

    /*
        Tx 2: submit bounty
        * submit CID of zkey, circom
        * submit verifier address
        * submit proof
    */
    function submitBounty(
        bytes memory _zkeyCID,
        bytes memory _circomCID,
        bytes memory _verifierCID,
        address _verifier,
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[] memory _input
    ) public /*
     * n = dataCIDs.length
     * first n elements of input should be the model output
     * the next 2n elements of input should be the splitted dataCIDs
     * the last element is the model hash
     */
    {
        require(bountyHunter == address(0), "Bounty already submitted");
        // verifier address should not be 0x0
        require(_verifier != address(0), "Invalid verifier address");

        uint n = dataCIDs.length;
        require(_input.length == 3 * n + 1, "Invalid input length");

        // check if accuracy threshold is met
        uint numCorrect = 0;
        for (uint i = 0; i < n; i++) {
            if (_input[i] == labels[i]) {
                numCorrect++;
            }
        }
        require(
            (numCorrect * 100) / n >= accuracyThreshold,
            "Accuracy threshold not met"
        );

        for (uint i = 0; i < dataCIDs.length; i++) {
            require(
                keccak256(dataCIDs[i]) ==
                    keccak256(
                        abi.encodePacked(
                            CID_VERSION,
                            CID_CODEC,
                            CID_HASH,
                            CID_LENGTH,
                            concatDigest(
                                _input[n + i * 2],
                                _input[n + i * 2 + 1]
                            )
                        )
                    ),
                "Data CID mismatch"
            );
        }

        verifier = ICircuitVerifier(_verifier);
        require(verifier.verifyProof(_a, _b, _c, _input), "Invalid proof");
        a = _a;
        b = _b;
        c = _c;
        modelHash = _input[3 * n];

        zkeyCID = _zkeyCID;
        circomCID = _circomCID;
        verifierCID = _verifierCID;

        bountyHunter = msg.sender;

        emit BountyUpdated(2);
        completedStep = 2;
    }

    /*
        Tx 3: release bounty
        * only callable by bounty provider
        * only callable if bounty is not complete
        * only callable if bounty hunter has submitted proof
    */
    function releaseBounty(uint[2] memory _publicKeys) public onlyOwner {
        require(!isComplete, "Bounty is already complete");
        require(a[0] != 0, "Bounty hunter has not submitted proof");

        publicKeys = _publicKeys;
        isComplete = true;

        emit BountyUpdated(3);
        completedStep = 3;
    }

    /*
        Tx 4: claim bounty
        * function to submit preimage of hashed input
        * only callable if SHA256 of preimage matched hashed input
        * only callable if bounty is complete
        * _input
    */
    function claimBounty(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[1005] memory _input
        /*
            * first element is the model hash
            * the next element is the shared key
            * the next 1001 elements are the encrypted input
            * the last 2 elements are the public keys
        */
    ) public {
        require(
            msg.sender == bountyHunter,
            "Only bounty hunter can claim bounty"
        );
        require(isComplete, "Bounty is not complete");
        require(address(this).balance > 0, "Bounty already claimed");

        // verify model hash
        require(
            modelHash == _input[0],
            "Model hash does not match submitted proof"
        );

        // verify public keys
        require(
            publicKeys[0] == _input[1003] && publicKeys[1] == _input[1004],
            "Public keys do not match"
        );

        // verify encryption
        require(
            encryptionVerifier.verifyProof(_a, _b, _c, _input),
            "Invalid encryption"
        );
        input = _input;
        payable(msg.sender).transfer(address(this).balance);

        emit BountyUpdated(4);
        completedStep = 4;
    }

    // function to concat input into digest
    function concatDigest(
        uint input1,
        uint input2
    ) public pure returns (bytes32) {
        return bytes32((input1 << 128) + input2);
    }

    // view function to verify proof
    function verifyProof(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[] memory _input
    ) public view returns (bool) {
        return verifier.verifyProof(_a, _b, _c, _input);
    }

    // view function to verify encryption
    function verifyEncryption(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[1005] memory _input
    ) public view returns (bool) {
        return encryptionVerifier.verifyProof(_a, _b, _c, _input);
    }
    
    // TODO: function to cancel bounty and withdraw reward

    // TODO: function to edit bounty details
}
