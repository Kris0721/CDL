# Azure Backend - ARCHIVED

> [!WARNING]
> **This Azure backend implementation has been archived.**
> 
> The CDL DeFi Lending Platform now uses **AWS** as the primary backend infrastructure.

## Why Archived?

This folder contains the Azure Functions-based backend implementation that was previously used. The project has been migrated to use AWS Lambda and related AWS services for the following reasons:

- Standardization on AWS infrastructure
- Better integration with existing AWS services
- Cost optimization
- Team expertise and preference

## Current Backend

Please use the **`backend/`** folder for the active AWS-based backend implementation.

## Documentation

- For AWS deployment: See [docs/AWS_SETUP.md](../docs/AWS_SETUP.md)
- For Azure reference: See [docs/AZURE_SETUP.md](../docs/AZURE_SETUP.md) (deprecated)

## Contents

This folder is kept for reference and contains:
- Azure Functions implementation (`function_app.py`)
- Azure infrastructure templates (Bicep files in `infrastructure/`)
- Deployment scripts (`deploy-azure.sh`, `deploy-azure.ps1`)
- Shared utilities and function handlers

## Migration Notes

If you need to reference the Azure implementation:
- Database: Cosmos DB → DynamoDB
- Storage: Azure Blob Storage → Amazon S3
- Email: Azure Communication Services → Amazon SES
- Functions: Azure Functions → AWS Lambda
- API: Azure Functions HTTP triggers → Amazon API Gateway

---

**Last Updated**: February 2026
**Status**: Archived - Not actively maintained
