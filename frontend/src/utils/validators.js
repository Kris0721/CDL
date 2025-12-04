// Validate email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate password
export const isValidPassword = (password) => {
    return password.length >= 8;
};

// Validate Ethereum address
export const isValidAddress = (address) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
};

// Validate amount
export const isValidAmount = (amount, min = 0, max = Infinity) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num >= min && num <= max;
};

// Validate phone number
export const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};
