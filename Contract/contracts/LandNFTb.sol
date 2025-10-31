// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";
import "./ExpiryHelper.sol";

/**
 * @title LandNFT (Hedera-compatible Core DAO version)
 * @notice Fully compatible with the previous ERC1155-based LandNFT ABI.
 * Maintains Core DAO naming, variables, and behavior, but uses
 * Hedera Token Service (HTS) for NFT creation and minting.
 */
contract LandNFT is ExpiryHelper {
    // --------------------------------------------------------
    //  State Variables (mirroring Core DAO)
    // --------------------------------------------------------

    uint256 private currentTokenId;
    uint256 public mintFee = 100000; // in tinybars (0.001 HBAR)

    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => bytes32) private _tokenRegions;
    mapping(uint256 => bool) private _isVerified;
    mapping(address => bool) public verifiers;

    mapping(uint256 => uint256) public purchasePriceUSD;
    mapping(uint256 => uint256) public askingPriceUSD;
    mapping(uint256 => bool) public loanLocked;

    address public lendingContract;
    address public owner;
    address public landCollectionToken; // HTS token address

    // --------------------------------------------------------
    //  Events (same as Core DAO)
    // --------------------------------------------------------

    event LandVerified(uint256 indexed tokenId, bool status);
    event VerificationRequested(uint256 indexed tokenId, address indexed requester);
    event AskingPriceUpdated(uint256 indexed tokenId, uint256 newPriceUSD, string newMetadataURI);
    event LendingContractSet(address indexed previous, address indexed newAddress);
    event LandNFTCreated(address indexed tokenAddress, string name, string symbol);
    event LandNFTMinted(
        address indexed collection,
        address indexed to,
        int64 serial,
        string metadataURI,
        bytes32 region,
        uint256 purchasePriceUSD
    );
    // --------------------------------------------------------
    //  Constructor
    // --------------------------------------------------------

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyLendingContract() {
        require(msg.sender == lendingContract, "Not authorized");
        _;
    }

    // --------------------------------------------------------
    //  Admin Controls
    // --------------------------------------------------------

    function setLendingContract(address _lendingContract) external onlyOwner {
        require(_lendingContract != address(0), "Zero address");
        address prev = lendingContract;
        lendingContract = _lendingContract;
        emit LendingContractSet(prev, _lendingContract);
    }

    function setVerifier(address verifier, bool status) external onlyOwner {
        verifiers[verifier] = status;
    }

    function setMintFee(uint256 newFee) external onlyOwner {
        mintFee = newFee;
    }

    function viewMintFee() external view returns (uint256) {
        return mintFee;
    }

    // --------------------------------------------------------
    //  Token Creation (HTS)
    // --------------------------------------------------------

    /**
     * @notice Creates the main Land NFT collection using HTS.
     * Should be called once before minting.
     */


    function createLandCollection(
        string memory name,
        string memory symbol,
        string memory memo,
        int64 maxSupply,
        uint32 autoRenewPeriod
    ) external payable onlyOwner returns (address createdToken) {
        // ✅ 1. Properly initialize the TokenKey array first
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);

        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        // 2️⃣ Build the HederaToken struct
        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = memo;
        token.treasury = address(this);
        token.tokenSupplyType = true; // finite supply
        token.maxSupply = maxSupply;
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod);

        // 3️⃣ Create the NFT collection via HTS
        (int responseCode, address tokenAddress) = HederaTokenService.createNonFungibleToken(token);
        require(responseCode == HederaResponseCodes.SUCCESS, "HTS create failed");

        landCollectionToken = tokenAddress;
        emit LandNFTCreated(tokenAddress, name, symbol);
        return tokenAddress;
    }

    // --------------------------------------------------------
    //  Minting
    // --------------------------------------------------------

    /**
     * @notice Mint land NFT with original purchase price (USD)
     * Maintains same signature and behavior as Core DAO version.
     */


    function mintLand(
        address to,
        string calldata metadataURI,
        uint256 /* amount */,
        bytes32 region,
        uint256 _purchasePriceUSD
    ) external payable {
        require(msg.value >= mintFee, "Insufficient mint fee");
        require(landCollectionToken != address(0), "Collection not created");
        require(region != bytes32(0), "Invalid region"); // ✅ PATCH 1: Validate region

        currentTokenId++;
        uint256 tokenId = currentTokenId;

        bytes[] memory metadata = new bytes[](1);
        metadata[0] = bytes(metadataURI);

        // Mint HTS NFT (1 unit = 1 serial number)
        (int response, , int64[] memory serials) = HederaTokenService.mintToken(
            landCollectionToken,
            0,
            metadata
        );
        require(response == HederaResponseCodes.SUCCESS, "HTS mint failed");

        int64 serial = serials[0];

        _tokenURIs[tokenId] = metadataURI;
        _tokenRegions[tokenId] = region;
        purchasePriceUSD[tokenId] = _purchasePriceUSD;
        askingPriceUSD[tokenId] = _purchasePriceUSD;

        // ✅ Emit detailed event that frontend can easily parse
        emit LandNFTMinted(
            landCollectionToken,
            to,
            serial,
            metadataURI,
            region,
            _purchasePriceUSD
        );
    }


    // --------------------------------------------------------
    //  Verification Logic
    // --------------------------------------------------------

    function requestVerification(address ownerAddr, uint256 tokenId) external {
        emit VerificationRequested(tokenId, ownerAddr);
    }

    // ✅ New event to include region info for better frontend indexing
    event LandVerifiedWithRegion(uint256 indexed tokenId, bytes32 indexed region, bool status);


    function setVerified(uint256 tokenId, bool status) external {
        require(verifiers[msg.sender], "Caller not authorized verifier");

        _isVerified[tokenId] = status;

        bytes32 region = _tokenRegions[tokenId];

        // Emit both for full compatibility
        emit LandVerified(tokenId, status);
        emit LandVerifiedWithRegion(tokenId, region, status);
    }

    function isVerified(uint256 tokenId) external view returns (bool) {
        return _isVerified[tokenId];
    }

    // --------------------------------------------------------
    //  Asking Price Management
    // --------------------------------------------------------

    function updateAskingPrice(uint256 tokenId, uint256 newPriceUSD, string calldata newMetadataURI)
        external
    {
        askingPriceUSD[tokenId] = newPriceUSD;
        _tokenURIs[tokenId] = newMetadataURI;
        emit AskingPriceUpdated(tokenId, newPriceUSD, newMetadataURI);
    }

    // --------------------------------------------------------
    //  Lending Logic
    // --------------------------------------------------------

    function lockForLoan(uint256 tokenId) external onlyLendingContract {
        loanLocked[tokenId] = true;
    }

    function unlockFromLoan(uint256 tokenId) external onlyLendingContract {
        loanLocked[tokenId] = false;
    }

    // --------------------------------------------------------
    //  View Functions
    // --------------------------------------------------------

    function uri(uint256 tokenId) external view returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function getRegion(uint256 tokenId) external view returns (bytes32) {
        return _tokenRegions[tokenId];
    }

    // --------------------------------------------------------
    //  Owner Utilities
    // --------------------------------------------------------

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
