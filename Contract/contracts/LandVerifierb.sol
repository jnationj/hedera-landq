// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";
import "./LandNFTb.sol";

/**
 * @title LandVerifier
 * @notice Manages regional verification and appraisal for LandNFT on Hedera.
 * @dev Integrates with LandNFT that exposes getRegion() and setVerified().
 */
contract LandVerifier is HederaTokenService {
    LandNFT public landNFT;

    // --------------------------------------------------------
    //  Ownership control for assigning verifiers
    // --------------------------------------------------------
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    // --------------------------------------------------------
    //  Structs and Storage
    // --------------------------------------------------------
    struct VerificationRecord {
        bool isVerified;
        bool isRejected;
        address verifier;
        uint256 verifiedAt;
        string notes;
        uint256 appraisedValueUSD;
    }

    /// region => verifier address
    mapping(bytes32 => address) public regionVerifiers;

    /// tokenId => verification record
    mapping(uint256 => VerificationRecord) public verificationRecords;

    // --------------------------------------------------------
    //  Events
    // --------------------------------------------------------
    event VerifierAssigned(bytes32 indexed region, address indexed verifier);
    event VerifierRemoved(bytes32 indexed region);
    event VerificationRequested(address indexed requester, uint256 indexed tokenId, bytes32 indexed region);
    event LandVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        bytes32 indexed region,
        uint256 appraisedValueUSD,
        string notes
    );
    event LandRejected(uint256 indexed tokenId, address indexed verifier, bytes32 indexed region, string reason);

    // --------------------------------------------------------
    //  Constructor
    // --------------------------------------------------------
    constructor(address _landNFT) {
        require(_landNFT != address(0), "Invalid LandNFT address");
        owner = msg.sender; // ✅ initialize owner
        landNFT = LandNFT(_landNFT);
    }

    // --------------------------------------------------------
    //  Verifier Management
    // --------------------------------------------------------

    function assignVerifier(bytes32 region, address verifier) external onlyOwner {
        require(verifier != address(0), "Invalid verifier address");
        regionVerifiers[region] = verifier;
        emit VerifierAssigned(region, verifier);
    }

    function removeVerifier(bytes32 region) external onlyOwner {
        require(regionVerifiers[region] != address(0), "No verifier assigned");
        delete regionVerifiers[region];
        emit VerifierRemoved(region);
    }

    // --------------------------------------------------------
    //  Verification Flow
    // --------------------------------------------------------

    /**
     * @notice Land owner requests verification for their NFT.
     */
    function requestVerification(uint256 tokenId) external {
        bytes32 region = landNFT.getRegion(tokenId);
        require(regionVerifiers[region] != address(0), "No verifier for region");

        landNFT.requestVerification(msg.sender, tokenId);
        emit VerificationRequested(msg.sender, tokenId, region);
    }

    /**
     * @notice Assigned regional verifier marks land as verified and appraises its value.
     */
    function verifyLand(uint256 tokenId, uint256 appraisedValueUSD, string calldata notes) external {
        bytes32 region = landNFT.getRegion(tokenId);
        require(regionVerifiers[region] == msg.sender, "Not region verifier");

        landNFT.setVerified(tokenId, true);

        verificationRecords[tokenId] = VerificationRecord({
            isVerified: true,
            isRejected: false,
            verifier: msg.sender,
            verifiedAt: block.timestamp,
            notes: notes,
            appraisedValueUSD: appraisedValueUSD
        });

        emit LandVerified(tokenId, msg.sender, region, appraisedValueUSD, notes);
    }

    /**
     * @notice Assigned regional verifier rejects the land verification.
     */
    function rejectLand(uint256 tokenId, string calldata reason) external {
        bytes32 region = landNFT.getRegion(tokenId);
        require(regionVerifiers[region] == msg.sender, "Not region verifier");

        landNFT.setVerified(tokenId, false);

        verificationRecords[tokenId] = VerificationRecord({
            isVerified: false,
            isRejected: true,
            verifier: msg.sender,
            verifiedAt: block.timestamp,
            notes: reason,
            appraisedValueUSD: 0
        });

        emit LandRejected(tokenId, msg.sender, region, reason);
    }

    // --------------------------------------------------------
    //  View Helpers
    // --------------------------------------------------------

    function getVerification(uint256 tokenId) external view returns (VerificationRecord memory) {
        return verificationRecords[tokenId];
    }

    function getRegionVerifier(bytes32 region) external view returns (address) {
        return regionVerifiers[region];
    }

    function getAppraisedPrice(uint256 tokenId) external view returns (uint256) {
        return verificationRecords[tokenId].appraisedValueUSD;
    }
}
