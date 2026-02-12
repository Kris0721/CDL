"""
Storage utilities for Azure Blob Storage
Handles KYC document uploads and management
"""
import os
from datetime import datetime, timedelta
from azure.storage.blob import BlobServiceClient, BlobSasPermissions, generate_blob_sas
from typing import Optional

class BlobStorageClient:
    """Azure Blob Storage client wrapper"""
    
    def __init__(self):
        account_name = os.environ.get('STORAGE_ACCOUNT_NAME')
        account_key = os.environ.get('STORAGE_ACCOUNT_KEY')
        container_name = os.environ.get('KYC_CONTAINER_NAME', 'kyc-documents')
        
        connection_string = f"DefaultEndpointsProtocol=https;AccountName={account_name};AccountKey={account_key};EndpointSuffix=core.windows.net"
        
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_client = self.blob_service_client.get_container_client(container_name)
        self.account_name = account_name
        self.account_key = account_key
        self.container_name = container_name
    
    def upload_file(self, file_name: str, file_data: bytes, content_type: str = 'application/octet-stream') -> str:
        """
        Upload a file to blob storage
        Returns the blob URL
        """
        blob_client = self.container_client.get_blob_client(file_name)
        blob_client.upload_blob(file_data, overwrite=True, content_settings={'content_type': content_type})
        return blob_client.url
    
    def download_file(self, file_name: str) -> bytes:
        """Download a file from blob storage"""
        blob_client = self.container_client.get_blob_client(file_name)
        return blob_client.download_blob().readall()
    
    def delete_file(self, file_name: str) -> None:
        """Delete a file from blob storage"""
        blob_client = self.container_client.get_blob_client(file_name)
        blob_client.delete_blob()
    
    def generate_sas_url(self, file_name: str, expiry_hours: int = 1) -> str:
        """
        Generate a SAS URL for temporary access to a blob
        """
        blob_client = self.container_client.get_blob_client(file_name)
        
        sas_token = generate_blob_sas(
            account_name=self.account_name,
            container_name=self.container_name,
            blob_name=file_name,
            account_key=self.account_key,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
        )
        
        return f"{blob_client.url}?{sas_token}"
    
    def file_exists(self, file_name: str) -> bool:
        """Check if a file exists in blob storage"""
        blob_client = self.container_client.get_blob_client(file_name)
        return blob_client.exists()

# Singleton instance
_storage_client = None

def get_storage_client() -> BlobStorageClient:
    """Get or create the storage client singleton"""
    global _storage_client
    if _storage_client is None:
        _storage_client = BlobStorageClient()
    return _storage_client
