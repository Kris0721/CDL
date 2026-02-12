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
    @staticmethod
    def get_open_requests():
        """Get all open loan requests for marketplace"""
        # Note: credit_score might not exist in users table yet based on schema
        # For now, let's just return borrower name.
        
        requests = db.execute_query(
            '''SELECT l.*, u.full_name as borrower_name
               FROM loans l
               JOIN users u ON l.borrower_id = u.user_id
               WHERE l.status = 'open'
               ORDER BY l.created_at DESC'''
        )
        
        return {'requests': [dict(r) for r in requests]}, 200

    @staticmethod
    def make_offer(lender_id, loan_id, interest_rate):
        """Make an offer on a loan request"""
        # Validate loan exists and is open
        loan = db.execute_query('SELECT * FROM loans WHERE loan_id = ?', (loan_id,))
        if not loan:
            return {'error': 'Loan not found'}, 404
        if loan[0]['status'] != 'open':
            return {'error': 'Loan is not open for offers'}, 400

        # Check if offer already exists
        existing = db.execute_query(
            'SELECT * FROM loan_offers WHERE loan_id = ? AND lender_id = ?',
            (loan_id, lender_id)
        )
        if existing:
            return {'error': 'You have already made an offer on this loan'}, 400

        offer_id = str(uuid.uuid4())
        now = int(time.time())

        db.execute_update(
            '''INSERT INTO loan_offers 
               (offer_id, loan_id, lender_id, interest_rate, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?)''',
            (offer_id, loan_id, lender_id, float(interest_rate), 'pending', now)
        )

        return {
            'message': 'Offer submitted successfully',
            'offerId': offer_id,
            'interestRate': interest_rate
        }, 201

    @staticmethod
    def get_lender_offers(lender_id):
        """Get all offers made by a lender"""
        offers = db.execute_query(
            'SELECT * FROM loan_offers WHERE lender_id = ?',
            (lender_id,)
        )
        return {'offers': [dict(o) for o in offers]}, 200
