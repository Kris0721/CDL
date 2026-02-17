// IMPORTANT: This is a template file
// Copy this file to 'apiKeys.js' and add your actual API keys
// The apiKeys.js file is gitignored and will not be committed to GitHub

export const API_KEYS = {
    CURRENCY_API_KEY: "YOUR_AMDOREN_API_KEY_HERE", // Get from: https://www.amdoren.com/
    CRYPTO_API_KEY: "YOUR_COINLAYER_API_KEY_HERE"  // Get from: https://coinlayer.com/
};

export const API_ENDPOINTS = {
    // Amdoren
    CURRENCY: "https://www.amdoren.com/api/currency.php",

    // CoinLayer (Using HTTP as free tier often doesn't support HTTPS or I'll try to use a proxy if needed)
    // Note: If app is HTTPS, this might fail (Mixed Content). Validation will verify.
    CRYPTO: "http://api.coinlayer.com/live"
};
