"""Lender service"""
import uuid
import time
from database.db import db
from database.models import Deposit

class LenderService:
    """Handle lender operations"""
    
    @staticmethod
    def deposit_funds(lender_id, amount, lock_duration, interest_rate):
        """Deposit funds into the lending pool"""
        deposit_id = str(uuid.uuid4())
        now = int(time.time())
        end_time = now + (lock_duration * 24 * 60 * 60)
        
        db.execute_update(
            '''INSERT INTO deposits 
               (deposit_id, lender_id, amount, lock_duration, interest_rate, start_time, end_time, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)''',
            (deposit_id, lender_id, amount, lock_duration, interest_rate, now, end_time, now)
        )
        
        # Create a transaction record for the deposit
        tx_id = str(uuid.uuid4())
        db.execute_update(
            '''INSERT INTO transactions 
               (transaction_id, user_id, transaction_type, amount, status, timestamp)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (tx_id, lender_id, 'deposit', amount, 'completed', now)
        )
        
        print(f"[EMAIL] Deposit of ${amount} received from lender {lender_id}")
        
        return {
            'message': 'Funds deposited successfully',
            'depositId': deposit_id,
            'transactionId': tx_id
        }, 201
    
    @staticmethod
    def get_deposits(lender_id):
        """Get all deposits for a lender"""
        deposits = db.execute_query(
            'SELECT * FROM deposits WHERE lender_id = ? ORDER BY created_at DESC',
            (lender_id,)
        )
        
        return {
            'deposits': [Deposit.to_dict(d) for d in deposits]
        }, 200
