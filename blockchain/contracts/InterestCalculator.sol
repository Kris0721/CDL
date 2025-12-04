// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InterestCalculator {
    // Interest rates in basis points (1% = 100)
    uint256 public constant RATE_30_DAYS = 600;   // 6%
    uint256 public constant RATE_60_DAYS = 750;   // 7.5%
    uint256 public constant RATE_90_DAYS = 850;   // 8.5%
    uint256 public constant RATE_180_DAYS = 1000; // 10%
    
    uint256 public constant DAYS_IN_YEAR = 365;
    uint256 public constant BASIS_POINTS = 10000;
    
    function calculateInterestRate(uint256 duration) public pure returns (uint256) {
        if (duration >= 180 days) return RATE_180_DAYS;
        if (duration >= 90 days) return RATE_90_DAYS;
        if (duration >= 60 days) return RATE_60_DAYS;
        return RATE_30_DAYS;
    }
    
    function calculateInterest(
        uint256 principal,
        uint256 rate,
        uint256 duration
    ) public pure returns (uint256) {
        return (principal * rate * duration) / (BASIS_POINTS * DAYS_IN_YEAR * 1 days);
    }
    
    function calculateTotalRepayment(
        uint256 principal,
        uint256 duration
    ) public pure returns (uint256) {
        uint256 rate = calculateInterestRate(duration);
        uint256 interest = calculateInterest(principal, rate, duration);
        return principal + interest;
    }
    
    function calculateAPY(uint256 rate, uint256 compoundFrequency) public pure returns (uint256) {
        // Simple APY calculation: (1 + rate/frequency)^frequency - 1
        // For simplicity, returning the rate itself
        return rate;
    }
}
