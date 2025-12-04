import React, { createContext, useState, useContext, useEffect } from 'react';

// Create Platform Data Context
const PlatformDataContext = createContext();

// Custom hook to use platform data
export const usePlatformData = () => {
    const context = useContext(PlatformDataContext);
    if (!context) {
        throw new Error('usePlatformData must be used within PlatformDataProvider');
    }
    return context;
};

// Platform Data Provider Component
export const PlatformDataProvider = ({ children }) => {
    // Initialize from localStorage or use defaults
    const [platformData, setPlatformData] = useState(() => {
        const saved = localStorage.getItem('platformData');
        return saved ? JSON.parse(saved) : {
            users: {
                total: 3, // Kris, Lender, Borrower
                lenders: 1,
                borrowers: 1,
                maintainers: 1
            },
            loans: [],
            lending: [],
            stats: {
                totalLoansIssued: 0,
                totalAmountLent: 0,
                totalAmountBorrowed: 0,
                totalInterestEarned: 0,
                activeLoans: 0
            }
        };
    });

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('platformData', JSON.stringify(platformData));
    }, [platformData]);

    // Add a new loan
    const addLoan = (loanData) => {
        const newLoan = {
            id: `L${String(platformData.loans.length + 1).padStart(3, '0')}`,
            ...loanData,
            status: 'active',
            createdAt: new Date().toISOString(),
            remainingAmount: loanData.amount + (loanData.amount * loanData.interestRate / 100)
        };

        setPlatformData(prev => ({
            ...prev,
            loans: [...prev.loans, newLoan],
            stats: {
                ...prev.stats,
                totalLoansIssued: prev.stats.totalLoansIssued + 1,
                totalAmountBorrowed: prev.stats.totalAmountBorrowed + loanData.amount,
                activeLoans: prev.stats.activeLoans + 1
            }
        }));

        return newLoan;
    };

    // Add new lending
    const addLending = (lendingData) => {
        const newLending = {
            id: `LD${String(platformData.lending.length + 1).padStart(3, '0')}`,
            ...lendingData,
            status: 'active',
            createdAt: new Date().toISOString()
        };

        setPlatformData(prev => ({
            ...prev,
            lending: [...prev.lending, newLending],
            stats: {
                ...prev.stats,
                totalAmountLent: prev.stats.totalAmountLent + lendingData.amount
            }
        }));

        return newLending;
    };

    // Repay loan
    const repayLoan = (loanId, amount) => {
        setPlatformData(prev => {
            const updatedLoans = prev.loans.map(loan => {
                if (loan.id === loanId) {
                    const newRemaining = loan.remainingAmount - amount;
                    return {
                        ...loan,
                        remainingAmount: newRemaining,
                        status: newRemaining <= 0 ? 'repaid' : 'active'
                    };
                }
                return loan;
            });

            const activeLoans = updatedLoans.filter(l => l.status === 'active').length;

            return {
                ...prev,
                loans: updatedLoans,
                stats: {
                    ...prev.stats,
                    activeLoans
                }
            };
        });
    };

    // Add new user
    const addUser = (userType) => {
        setPlatformData(prev => ({
            ...prev,
            users: {
                ...prev.users,
                total: prev.users.total + 1,
                [userType + 's']: prev.users[userType + 's'] + 1
            }
        }));
    };

    // Get user-specific data
    const getUserLoans = (userEmail, userType) => {
        if (userType === 'borrower') {
            return platformData.loans.filter(loan => loan.borrowerEmail === userEmail);
        } else if (userType === 'lender') {
            return platformData.loans.filter(loan => loan.lenderEmail === userEmail);
        }
        return [];
    };

    const getUserLending = (userEmail) => {
        return platformData.lending.filter(lending => lending.lenderEmail === userEmail);
    };

    // Get user stats
    const getUserStats = (userEmail, userType) => {
        const userLoans = getUserLoans(userEmail, userType);

        if (userType === 'borrower') {
            const activeLoans = userLoans.filter(l => l.status === 'active');
            const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
            const totalRepaid = userLoans.reduce((sum, loan) =>
                sum + (loan.amount - loan.remainingAmount), 0
            );

            return {
                totalBorrowed,
                activeLoans: activeLoans.length,
                totalRepaid,
                loans: userLoans
            };
        } else if (userType === 'lender') {
            const userLendings = getUserLending(userEmail);
            const totalLent = userLendings.reduce((sum, lending) => sum + lending.amount, 0);
            const activeLoans = userLoans.filter(l => l.status === 'active').length;

            // Calculate earned interest from completed loans
            const completedLoans = userLoans.filter(l => l.status === 'repaid');
            const totalEarned = completedLoans.reduce((sum, loan) =>
                sum + (loan.amount * loan.interestRate / 100), 0
            );

            return {
                totalLent,
                activeLoans,
                totalEarned,
                loans: userLoans,
                lending: userLendings
            };
        }

        return {};
    };

    // Reset platform data (for testing)
    const resetPlatformData = () => {
        const defaultData = {
            users: {
                total: 3,
                lenders: 1,
                borrowers: 1,
                maintainers: 1
            },
            loans: [],
            lending: [],
            stats: {
                totalLoansIssued: 0,
                totalAmountLent: 0,
                totalAmountBorrowed: 0,
                totalInterestEarned: 0,
                activeLoans: 0
            }
        };
        setPlatformData(defaultData);
        localStorage.setItem('platformData', JSON.stringify(defaultData));
    };

    const value = {
        platformData,
        addLoan,
        addLending,
        repayLoan,
        addUser,
        getUserLoans,
        getUserLending,
        getUserStats,
        resetPlatformData
    };

    return (
        <PlatformDataContext.Provider value={value}>
            {children}
        </PlatformDataContext.Provider>
    );
};
