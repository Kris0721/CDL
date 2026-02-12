"""
Shared utilities for Azure Functions
Database operations using Azure Cosmos DB
"""
import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions
from typing import Dict, List, Optional, Any

class CosmosDBClient:
    """Azure Cosmos DB client wrapper"""
    
    def __init__(self):
        endpoint = os.environ.get('COSMOS_DB_ENDPOINT')
        key = os.environ.get('COSMOS_DB_KEY')
        database_name = os.environ.get('COSMOS_DB_DATABASE', 'CDL-Database')
        
        self.client = CosmosClient(endpoint, key)
        self.database = self.client.get_database_client(database_name)
        
        # Container clients
        self.users = self.database.get_container_client('Users')
        self.loans = self.database.get_container_client('Loans')
        self.transactions = self.database.get_container_client('Transactions')
        self.kyc_documents = self.database.get_container_client('KYCDocuments')
    
    def create_item(self, container_name: str, item: Dict) -> Dict:
        """Create a new item in the specified container"""
        container = getattr(self, container_name.lower())
        return container.create_item(body=item)
    
    def get_item(self, container_name: str, item_id: str, partition_key: str) -> Optional[Dict]:
        """Get an item by ID and partition key"""
        try:
            container = getattr(self, container_name.lower())
            return container.read_item(item=item_id, partition_key=partition_key)
        except exceptions.CosmosResourceNotFoundError:
            return None
    
    def update_item(self, container_name: str, item: Dict) -> Dict:
        """Update an existing item"""
        container = getattr(self, container_name.lower())
        return container.upsert_item(body=item)
    
    def delete_item(self, container_name: str, item_id: str, partition_key: str) -> None:
        """Delete an item"""
        container = getattr(self, container_name.lower())
        container.delete_item(item=item_id, partition_key=partition_key)
    
    def query_items(self, container_name: str, query: str, parameters: Optional[List] = None) -> List[Dict]:
        """Query items using SQL query"""
        container = getattr(self, container_name.lower())
        items = container.query_items(
            query=query,
            parameters=parameters or [],
            enable_cross_partition_query=True
        )
        return list(items)
    
    # User operations
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by userId"""
        return self.get_item('users', user_id, user_id)
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email"""
        query = "SELECT * FROM c WHERE c.email = @email"
        parameters = [{"name": "@email", "value": email}]
        results = self.query_items('users', query, parameters)
        return results[0] if results else None
    
    def create_user(self, user_data: Dict) -> Dict:
        """Create a new user"""
        return self.create_item('users', user_data)
    
    def update_user(self, user_data: Dict) -> Dict:
        """Update user data"""
        return self.update_item('users', user_data)
    
    # Loan operations
    def get_loan_by_id(self, loan_id: str) -> Optional[Dict]:
        """Get loan by loanId"""
        return self.get_item('loans', loan_id, loan_id)
    
    def get_loans_by_borrower(self, borrower_id: str) -> List[Dict]:
        """Get all loans for a borrower"""
        query = "SELECT * FROM c WHERE c.borrowerId = @borrowerId"
        parameters = [{"name": "@borrowerId", "value": borrower_id}]
        return self.query_items('loans', query, parameters)
    
    def get_loans_by_status(self, status: str) -> List[Dict]:
        """Get all loans with a specific status"""
        query = "SELECT * FROM c WHERE c.status = @status"
        parameters = [{"name": "@status", "value": status}]
        return self.query_items('loans', query, parameters)
    
    def get_all_loans(self) -> List[Dict]:
        """Get all loans"""
        query = "SELECT * FROM c"
        return self.query_items('loans', query)
    
    def create_loan(self, loan_data: Dict) -> Dict:
        """Create a new loan"""
        return self.create_item('loans', loan_data)
    
    def update_loan(self, loan_data: Dict) -> Dict:
        """Update loan data"""
        return self.update_item('loans', loan_data)
    
    # Transaction operations
    def get_transaction_by_id(self, transaction_id: str) -> Optional[Dict]:
        """Get transaction by transactionId"""
        return self.get_item('transactions', transaction_id, transaction_id)
    
    def get_transactions_by_user(self, user_id: str) -> List[Dict]:
        """Get all transactions for a user"""
        query = "SELECT * FROM c WHERE c.userId = @userId ORDER BY c.timestamp DESC"
        parameters = [{"name": "@userId", "value": user_id}]
        return self.query_items('transactions', query, parameters)
    
    def create_transaction(self, transaction_data: Dict) -> Dict:
        """Create a new transaction"""
        return self.create_item('transactions', transaction_data)
    
    # KYC operations
    def get_kyc_documents_by_user(self, user_id: str) -> List[Dict]:
        """Get all KYC documents for a user"""
        query = "SELECT * FROM c WHERE c.userId = @userId"
        parameters = [{"name": "@userId", "value": user_id}]
        return self.query_items('kyc_documents', query, parameters)
    
    def create_kyc_document(self, kyc_data: Dict) -> Dict:
        """Create a new KYC document record"""
        return self.create_item('kyc_documents', kyc_data)
    
    def update_kyc_document(self, kyc_data: Dict) -> Dict:
        """Update KYC document data"""
        return self.update_item('kyc_documents', kyc_data)

# Singleton instance
_db_client = None

def get_db_client() -> CosmosDBClient:
    """Get or create the database client singleton"""
    global _db_client
    if _db_client is None:
        _db_client = CosmosDBClient()
    return _db_client
