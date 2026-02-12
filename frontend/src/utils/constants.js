export const CONTRACT_ADDRESSES = {
    localhost: {
        LendingPool: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        Token: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
        LoanManager: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    }
};

export const LENDING_POOL_ABI = [
    "function deposit(uint256 amount, uint256 lockDuration) external",
    "function withdraw(uint256 depositIndex) external",
    "function getUserDeposits(address user) external view returns (tuple(uint256 amount, uint256 timestamp, uint256 lockDuration, uint256 interestRate)[])",
    "event Deposited(address indexed lender, uint256 amount, uint256 lockDuration, uint256 interestRate)"
];

export const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];
