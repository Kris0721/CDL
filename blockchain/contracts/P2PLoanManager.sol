// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title P2PLoanManager
 * @dev Peer-to-peer lending contract where lenders can directly fund borrower requests
 */
contract P2PLoanManager is ReentrancyGuard {
    IERC20 public token;
    
    struct Loan {
        address borrower;
        address lender;
        uint256 amount;
        uint256 interestRate; // in basis points (e.g., 500 = 5%)
        uint256 duration;
        uint256 startTime;
        uint256 totalRepayment;
        uint256 amountRepaid;
        bool funded;
        bool completed;
    }
    
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;
    mapping(address => uint256[]) public lenderLoans;
    uint256 public loanCounter;
    
    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, uint256 duration, uint256 interestRate);
    event LoanFunded(uint256 indexed loanId, address indexed lender, address indexed borrower, uint256 amount);
    event LoanRepaid(uint256 indexed loanId, uint256 amount, uint256 remaining);
    event LoanCompleted(uint256 indexed loanId);
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    /**
     * @dev Calculate interest rate based on duration
     */
    function calculateInterestRate(uint256 duration) public pure returns (uint256) {
        if (duration <= 30 days) return 600;      // 6%
        if (duration <= 60 days) return 750;      // 7.5%
        if (duration <= 90 days) return 850;      // 8.5%
        return 1000;                               // 10%
    }
    
    /**
     * @dev Calculate interest amount
     */
    function calculateInterest(uint256 amount, uint256 rate, uint256 duration) public pure returns (uint256) {
        return (amount * rate * duration) / (10000 * 365 days);
    }
    
    /**
     * @dev Borrower requests a loan
     */
    function requestLoan(uint256 amount, uint256 duration) external returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(duration >= 30 days && duration <= 180 days, "Invalid duration");
        
        uint256 interestRate = calculateInterestRate(duration);
        uint256 interest = calculateInterest(amount, interestRate, duration);
        uint256 totalRepayment = amount + interest;
        
        uint256 loanId = loanCounter++;
        
        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            amount: amount,
            interestRate: interestRate,
            duration: duration,
            startTime: 0,
            totalRepayment: totalRepayment,
            amountRepaid: 0,
            funded: false,
            completed: false
        });
        
        borrowerLoans[msg.sender].push(loanId);
        
        emit LoanRequested(loanId, msg.sender, amount, duration, interestRate);
        
        return loanId;
    }
    
    /**
     * @dev Lender funds a loan request
     */
    function fundLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(!loan.funded, "Loan already funded");
        require(loan.borrower != address(0), "Loan does not exist");
        require(msg.sender != loan.borrower, "Borrower cannot fund own loan");
        
        loan.lender = msg.sender;
        loan.funded = true;
        loan.startTime = block.timestamp;
        
        lenderLoans[msg.sender].push(loanId);
        
        // Transfer funds from lender to borrower
        require(
            token.transferFrom(msg.sender, loan.borrower, loan.amount),
            "Transfer failed"
        );
        
        emit LoanFunded(loanId, msg.sender, loan.borrower, loan.amount);
    }
    
    /**
     * @dev Borrower repays loan
     */
    function repayLoan(uint256 loanId, uint256 amount) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.funded, "Loan not funded");
        require(!loan.completed, "Loan already completed");
        require(msg.sender == loan.borrower, "Only borrower can repay");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 remainingAmount = loan.totalRepayment - loan.amountRepaid;
        require(amount <= remainingAmount, "Amount exceeds remaining balance");
        
        // Transfer repayment from borrower to lender
        require(
            token.transferFrom(msg.sender, loan.lender, amount),
            "Transfer failed"
        );
        
        loan.amountRepaid += amount;
        
        emit LoanRepaid(loanId, amount, loan.totalRepayment - loan.amountRepaid);
        
        // Check if loan is fully repaid
        if (loan.amountRepaid >= loan.totalRepayment) {
            loan.completed = true;
            emit LoanCompleted(loanId);
        }
    }
    
    /**
     * @dev Get loan details
     */
    function getLoan(uint256 loanId) external view returns (Loan memory) {
        return loans[loanId];
    }
    
    /**
     * @dev Get all loans for a borrower
     */
    function getBorrowerLoans(address borrower) external view returns (uint256[] memory) {
        return borrowerLoans[borrower];
    }
    
    /**
     * @dev Get all loans funded by a lender
     */
    function getLenderLoans(address lender) external view returns (uint256[] memory) {
        return lenderLoans[lender];
    }
    
    /**
     * @dev Get remaining balance for a loan
     */
    function getRemainingBalance(uint256 loanId) external view returns (uint256) {
        Loan memory loan = loans[loanId];
        return loan.totalRepayment - loan.amountRepaid;
    }
    
    /**
     * @dev Check if loan is overdue
     */
    function isOverdue(uint256 loanId) external view returns (bool) {
        Loan memory loan = loans[loanId];
        if (!loan.funded || loan.completed) return false;
        return block.timestamp > loan.startTime + loan.duration;
    }
}
