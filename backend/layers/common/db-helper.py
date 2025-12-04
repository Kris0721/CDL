# Database helper functions
import boto3
import os

dynamodb = boto3.resource('dynamodb')

def get_table(table_name):
    """Get DynamoDB table resource"""
    return dynamodb.Table(table_name)

def query_by_index(table_name, index_name, key_name, key_value):
    """Query table by global secondary index"""
    table = get_table(table_name)
    response = table.query(
        IndexName=index_name,
        KeyConditionExpression=f'{key_name} = :value',
        ExpressionAttributeValues={':value': key_value}
    )
    return response.get('Items', [])

def scan_table(table_name, filter_expression=None):
    """Scan entire table with optional filter"""
    table = get_table(table_name)
    if filter_expression:
        response = table.scan(FilterExpression=filter_expression)
    else:
        response = table.scan()
    return response.get('Items', [])
