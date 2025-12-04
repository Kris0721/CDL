"""
Blockchain interaction utilities for Web3 operations
"""
from web3 import Web3
from typing import Dict, Optional, Any
import os
import json

# Initialize Web3 connection
RPC_URL = os.environ.get('BLOCKCHAIN_RPC_URL', 'http://localhost:8545')
web3 = Web3(Web3.HTTPProvider(RPC_URL))

# Contract addresses (should be set via environment variables)
LENDING_CONTRACT_ADDRESS = os.environ.get('LENDING_CONTRACT_ADDRESS', '')
USDC_CONTRACT_ADDRESS = os.environ.get('USDC_CONTRACT_ADDRESS', '')


def get_contract(contract_address: str, abi: list):
    """
    Get a contract instance
    
    Args:
        contract_address: Contract address
        abi: Contract ABI
        
    Returns:
        Contract instance
    """
    return web3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)


def is_valid_address(address: str) -> bool:
    """
    Check if an Ethereum address is valid
    
    Args:
        address: Ethereum address
        
    Returns:
        True if valid, False otherwise
    """
    return Web3.is_address(address)


def get_balance(address: str) -> float:
    """
    Get ETH balance of an address
    
    Args:
        address: Ethereum address
        
    Returns:
        Balance in ETH
    """
    try:
        balance_wei = web3.eth.get_balance(Web3.to_checksum_address(address))
        return float(web3.from_wei(balance_wei, 'ether'))
    except Exception as e:
        print(f"Error getting balance: {str(e)}")
        return 0.0


def get_transaction_receipt(tx_hash: str) -> Optional[Dict]:
    """
    Get transaction receipt
    
    Args:
        tx_hash: Transaction hash
        
    Returns:
        Transaction receipt dict if found, None otherwise
    """
    try:
        receipt = web3.eth.get_transaction_receipt(tx_hash)
        return dict(receipt)
    except Exception as e:
        print(f"Error getting transaction receipt: {str(e)}")
        return None


def verify_transaction(tx_hash: str, expected_from: str, expected_to: str, min_amount: float) -> bool:
    """
    Verify a transaction meets expected criteria
    
    Args:
        tx_hash: Transaction hash
        expected_from: Expected sender address
        expected_to: Expected recipient address
        min_amount: Minimum expected amount in ETH
        
    Returns:
        True if transaction is valid, False otherwise
    """
    try:
        tx = web3.eth.get_transaction(tx_hash)
        receipt = web3.eth.get_transaction_receipt(tx_hash)
        
        # Check transaction was successful
        if receipt['status'] != 1:
            return False
        
        # Check sender and recipient
        if tx['from'].lower() != expected_from.lower():
            return False
        
        if tx['to'].lower() != expected_to.lower():
            return False
        
        # Check amount
        amount_eth = float(web3.from_wei(tx['value'], 'ether'))
        if amount_eth < min_amount:
            return False
        
        return True
    except Exception as e:
        print(f"Error verifying transaction: {str(e)}")
        return False


def estimate_gas(transaction: Dict) -> int:
    """
    Estimate gas for a transaction
    
    Args:
        transaction: Transaction dict
        
    Returns:
        Estimated gas
    """
    try:
        return web3.eth.estimate_gas(transaction)
    except Exception as e:
        print(f"Error estimating gas: {str(e)}")
        return 21000  # Default gas limit


def get_current_gas_price() -> int:
    """
    Get current gas price
    
    Returns:
        Gas price in wei
    """
    try:
        return web3.eth.gas_price
    except Exception as e:
        print(f"Error getting gas price: {str(e)}")
        return web3.to_wei(20, 'gwei')  # Default gas price


def send_transaction(
    from_address: str,
    to_address: str,
    amount_eth: float,
    private_key: str,
    gas_limit: Optional[int] = None
) -> Optional[str]:
    """
    Send ETH transaction
    
    Args:
        from_address: Sender address
        to_address: Recipient address
        amount_eth: Amount in ETH
        private_key: Sender's private key
        gas_limit: Optional gas limit
        
    Returns:
        Transaction hash if successful, None otherwise
    """
    try:
        nonce = web3.eth.get_transaction_count(Web3.to_checksum_address(from_address))
        
        transaction = {
            'nonce': nonce,
            'to': Web3.to_checksum_address(to_address),
            'value': web3.to_wei(amount_eth, 'ether'),
            'gas': gas_limit or 21000,
            'gasPrice': get_current_gas_price(),
            'chainId': web3.eth.chain_id
        }
        
        signed_tx = web3.eth.account.sign_transaction(transaction, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        return web3.to_hex(tx_hash)
    except Exception as e:
        print(f"Error sending transaction: {str(e)}")
        return None


def call_contract_function(
    contract_address: str,
    abi: list,
    function_name: str,
    *args,
    **kwargs
) -> Any:
    """
    Call a read-only contract function
    
    Args:
        contract_address: Contract address
        abi: Contract ABI
        function_name: Function name to call
        *args: Function arguments
        **kwargs: Additional parameters
        
    Returns:
        Function return value
    """
    try:
        contract = get_contract(contract_address, abi)
        function = getattr(contract.functions, function_name)
        return function(*args).call(**kwargs)
    except Exception as e:
        print(f"Error calling contract function: {str(e)}")
        return None


def get_loan_contract_abi() -> list:
    """
    Get the lending contract ABI
    This should be loaded from a file or environment variable in production
    
    Returns:
        Contract ABI list
    """
    # Placeholder - should be loaded from actual contract ABI
    return []


def check_collateral_value(wallet_address: str, required_amount: float) -> bool:
    """
    Check if wallet has sufficient collateral
    
    Args:
        wallet_address: User's wallet address
        required_amount: Required collateral amount in ETH
        
    Returns:
        True if sufficient collateral, False otherwise
    """
    try:
        balance = get_balance(wallet_address)
        return balance >= required_amount
    except Exception as e:
        print(f"Error checking collateral: {str(e)}")
        return False
