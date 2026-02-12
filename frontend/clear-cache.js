// Run this in your browser console to clear old transaction data
// This will reset all cached loan data from the old USDC contracts

console.log("🧹 Clearing old loan transaction data...");

// Clear localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('loan') || key.includes('transaction') || key.includes('request'))) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    console.log(`Removing: ${key}`);
    localStorage.removeItem(key);
});

// Clear sessionStorage
const sessionKeysToRemove = [];
for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('loan') || key.includes('transaction') || key.includes('request'))) {
        sessionKeysToRemove.push(key);
    }
}

sessionKeysToRemove.forEach(key => {
    console.log(`Removing from session: ${key}`);
    sessionStorage.removeItem(key);
});

console.log("✅ Cleared old data!");
console.log("🔄 Please refresh the page now.");
