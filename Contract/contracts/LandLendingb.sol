// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";
import "./LandNFTb.sol";
import "./LandVerifierb.sol";

/**
 * @title LandLending
 * @notice Allows verified LandNFT holders to use their NFTs as collateral for loans using HTS tokens or HBAR.
 * @dev Hedera-compatible version merging Ethereum and CoreDAO lending logic.
 */
contract LandLending is HederaTokenService {
    LandNFT public landNFT;
    LandVerifier public landVerifier;

    address public owner;

    struct Loan {
        address borrower;
        uint256 tokenId;
        address paymentToken; // address(0) = HBAR, otherwise HTS token
        uint256 principal;
        uint256 interestRateBP; // e.g. 500 = 5%
        uint256 duration; // seconds
        uint256 startTime;
        uint256 repayAmount;
        bool isActive;
        bool isRepaid;
        bool isDefaulted;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId = 1;

    uint256 public constant BASIS_POINTS = 10_000;

    event LoanIssued(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 indexed tokenId,
        address paymentToken,
        uint256 principal,
        uint256 interestRateBP,
        uint256 duration,
        uint256 repayAmount
    );
    event LoanRepaid(uint256 indexed loanId, address borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId, address borrower);
    event CollateralReleased(uint256 indexed loanId, uint256 tokenId, address borrower);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _landNFT, address _landVerifier) {
        require(_landNFT != address(0), "Invalid LandNFT");
        require(_landVerifier != address(0), "Invalid LandVerifier");
        landNFT = LandNFT(_landNFT);
        landVerifier = LandVerifier(_landVerifier);
        owner = msg.sender;
    }

    // --------------------------------------------------------
    //  Loan Management
    // --------------------------------------------------------

    /**
     * @notice Issue a loan using a verified LandNFT as collateral.
     * @param tokenId LandNFT tokenId being used as collateral.
     * @param principal Loan principal amount.
     * @param interestRateBP Interest rate in basis points (e.g. 500 = 5%).
     * @param duration Loan duration in seconds.
     * @param paymentToken address(0) for HBAR or HTS token address.
     */
    function issueLoan(
        uint256 tokenId,
        uint256 principal,
        uint256 interestRateBP,
        uint256 duration,
        address paymentToken
    ) external payable returns (uint256 loanId) {
        require(principal > 0, "Invalid principal");
        require(duration > 0, "Invalid duration");
        require(!loans[tokenId].isActive, "Loan already active");
        require(landNFT.isVerified(tokenId), "Land not verified");
        require(!landNFT.loanLocked(tokenId), "Land already locked");

        uint256 appraisal = landVerifier.getAppraisedPrice(tokenId);
        require(appraisal > 0, "No appraisal set");
        require(principal <= appraisal / 2, "Exceeds 50% LTV");


        uint256 interest = (principal * interestRateBP) / BASIS_POINTS;
        uint256 repayAmount = principal + interest;

        // Lock NFT
        landNFT.lockForLoan(tokenId);

        // Store loan
        loanId = nextLoanId++;
        loans[tokenId] = Loan({
            borrower: msg.sender,
            tokenId: tokenId,
            paymentToken: paymentToken,
            principal: principal,
            interestRateBP: interestRateBP,
            duration: duration,
            startTime: block.timestamp,
            repayAmount: repayAmount,
            isActive: true,
            isRepaid: false,
            isDefaulted: false
        });

        // Disburse funds (HBAR or HTS token)
        if (paymentToken == address(0)) {
            require(address(this).balance >= principal, "Insufficient HBAR");
            payable(msg.sender).transfer(principal);
        } else {
            int response = HederaTokenService.transferToken(
                paymentToken,
                address(this),
                msg.sender,
                int64(int256(principal))
            );
            require(response == HederaResponseCodes.SUCCESS, "HTS transfer failed");
        }

        emit LoanIssued(
            loanId,
            msg.sender,
            tokenId,
            paymentToken,
            principal,
            interestRateBP,
            duration,
            repayAmount
        );
    }

    /**
     * @notice Repay a loan with HBAR or HTS token.
     */
    function repayLoan(uint256 tokenId) external payable {
        Loan storage loan = loans[tokenId];
        require(loan.isActive && !loan.isRepaid, "Invalid loan");
        require(msg.sender == loan.borrower, "Not borrower");

        uint256 due = loan.startTime + loan.duration;
        if (block.timestamp > due) {
            loan.isDefaulted = true;
        }

        if (loan.paymentToken == address(0)) {
            require(msg.value >= loan.repayAmount, "Insufficient HBAR repay");
        } else {
            int response = HederaTokenService.transferToken(
                loan.paymentToken,
                msg.sender,
                address(this),
                int64(int256(loan.repayAmount))
            );
            require(response == HederaResponseCodes.SUCCESS, "Token repay failed");
        }

        loan.isRepaid = true;
        loan.isActive = false;

        landNFT.unlockFromLoan(tokenId);

        emit LoanRepaid(tokenId, msg.sender, loan.repayAmount);
        emit CollateralReleased(tokenId, tokenId, msg.sender);
    }

    /**
     * @notice Mark a loan as defaulted if overdue.
     */
    function markDefault(uint256 tokenId) external {
        Loan storage loan = loans[tokenId];
        require(loan.isActive && !loan.isRepaid, "Invalid loan");
        require(block.timestamp > loan.startTime + loan.duration, "Loan not yet overdue");

        loan.isDefaulted = true;
        loan.isActive = false;

        emit LoanDefaulted(tokenId, loan.borrower);
    }

    // --------------------------------------------------------
    //  Admin / Utility
    // --------------------------------------------------------

    function setOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function withdrawHBAR(uint256 amount) external onlyOwner {
        payable(owner).transfer(amount);
    }

    function withdrawHTS(address token, uint256 amount) external onlyOwner {
        int response = HederaTokenService.transferToken(
            token,
            address(this),
            owner,
            int64(int256(amount))
        );
        require(response == HederaResponseCodes.SUCCESS, "Withdraw failed");
    }

    function getLoan(uint256 tokenId) external view returns (Loan memory) {
        return loans[tokenId];
    }

    receive() external payable {}
}
