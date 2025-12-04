"""
Database utility functions for DynamoDB operations
"""
import boto3
from boto3.dynamodb.conditions import Key, Attr
from typing import Dict, List, Optional, Any
from decimal import Decimal
import json

dynamodb = boto3.resource('dynamodb')


class DecimalEncoder(json.JSONEncoder):
    """Helper class to convert Decimal to float for JSON serialization"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)


def get_table(table_name: str):
    """Get DynamoDB table resource"""
    return dynamodb.Table(table_name)


def get_item_by_id(table_name: str, key_name: str, key_value: str) -> Optional[Dict]:
    """
    Get a single item from DynamoDB by primary key
    
    Args:
        table_name: Name of the DynamoDB table
        key_name: Name of the primary key attribute
        key_value: Value of the primary key
        
    Returns:
        Item dict if found, None otherwise
    """
    table = get_table(table_name)
    try:
        response = table.get_item(Key={key_name: key_value})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting item: {str(e)}")
        return None


def put_item(table_name: str, item: Dict) -> bool:
    """
    Put an item into DynamoDB
    
    Args:
        table_name: Name of the DynamoDB table
        item: Item dictionary to insert
        
    Returns:
        True if successful, False otherwise
    """
    table = get_table(table_name)
    try:
        table.put_item(Item=item)
        return True
    except Exception as e:
        print(f"Error putting item: {str(e)}")
        return False


def update_item(table_name: str, key: Dict, updates: Dict) -> Optional[Dict]:
    """
    Update an item in DynamoDB
    
    Args:
        table_name: Name of the DynamoDB table
        key: Primary key of the item to update
        updates: Dictionary of attribute names and values to update
        
    Returns:
        Updated item if successful, None otherwise
    """
    table = get_table(table_name)
    
    # Build update expression
    update_expr = "SET " + ", ".join([f"#{k} = :{k}" for k in updates.keys()])
    expr_attr_names = {f"#{k}": k for k in updates.keys()}
    expr_attr_values = {f":{k}": v for k, v in updates.items()}
    
    try:
        response = table.update_item(
            Key=key,
            UpdateExpression=update_expr,
            ExpressionAttributeNames=expr_attr_names,
            ExpressionAttributeValues=expr_attr_values,
            ReturnValues="ALL_NEW"
        )
        return response.get('Attributes')
    except Exception as e:
        print(f"Error updating item: {str(e)}")
        return None


def query_by_index(
    table_name: str,
    index_name: str,
    key_name: str,
    key_value: str,
    limit: int = 100,
    last_key: Optional[Dict] = None
) -> Dict:
    """
    Query items using a Global Secondary Index
    
    Args:
        table_name: Name of the DynamoDB table
        index_name: Name of the GSI
        key_name: Name of the partition key
        key_value: Value of the partition key
        limit: Maximum number of items to return
        last_key: Last evaluated key for pagination
        
    Returns:
        Dict with 'items' and 'lastKey' for pagination
    """
    table = get_table(table_name)
    
    query_params = {
        'IndexName': index_name,
        'KeyConditionExpression': Key(key_name).eq(key_value),
        'Limit': limit
    }
    
    if last_key:
        query_params['ExclusiveStartKey'] = last_key
    
    try:
        response = table.query(**query_params)
        return {
            'items': response.get('Items', []),
            'lastKey': response.get('LastEvaluatedKey')
        }
    except Exception as e:
        print(f"Error querying index: {str(e)}")
        return {'items': [], 'lastKey': None}


def scan_table(
    table_name: str,
    filter_expr: Optional[Any] = None,
    limit: int = 100,
    last_key: Optional[Dict] = None
) -> Dict:
    """
    Scan table with optional filter
    
    Args:
        table_name: Name of the DynamoDB table
        filter_expr: Filter expression (boto3.dynamodb.conditions)
        limit: Maximum number of items to return
        last_key: Last evaluated key for pagination
        
    Returns:
        Dict with 'items' and 'lastKey' for pagination
    """
    table = get_table(table_name)
    
    scan_params = {'Limit': limit}
    
    if filter_expr:
        scan_params['FilterExpression'] = filter_expr
    
    if last_key:
        scan_params['ExclusiveStartKey'] = last_key
    
    try:
        response = table.scan(**scan_params)
        return {
            'items': response.get('Items', []),
            'lastKey': response.get('LastEvaluatedKey')
        }
    except Exception as e:
        print(f"Error scanning table: {str(e)}")
        return {'items': [], 'lastKey': None}


def delete_item(table_name: str, key: Dict) -> bool:
    """
    Delete an item from DynamoDB
    
    Args:
        table_name: Name of the DynamoDB table
        key: Primary key of the item to delete
        
    Returns:
        True if successful, False otherwise
    """
    table = get_table(table_name)
    try:
        table.delete_item(Key=key)
        return True
    except Exception as e:
        print(f"Error deleting item: {str(e)}")
        return False


def convert_decimals(obj: Any) -> Any:
    """
    Recursively convert Decimal objects to float for JSON serialization
    
    Args:
        obj: Object to convert
        
    Returns:
        Converted object
    """
    if isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj
