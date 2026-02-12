#!/bin/bash

# Azure Deployment Script for CDL DeFi Lending Platform
# This script deploys the backend to Azure

set -e

echo "======================================"
echo "CDL DeFi - Azure Deployment Script"
echo "======================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Error: Azure CLI is not installed."
    echo "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Azure Functions Core Tools is installed
if ! command -v func &> /dev/null; then
    echo "Error: Azure Functions Core Tools is not installed."
    echo "Please install it from: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
    exit 1
fi

# Check if logged in to Azure
echo "Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Error: Not logged in to Azure."
    echo "Please run: az login"
    exit 1
fi

echo "✓ Azure CLI is configured"

# Configuration
RESOURCE_GROUP="cdl-defi-rg"
LOCATION="eastus"
JWT_SECRET_KEY=${JWT_SECRET_KEY:-$(openssl rand -base64 32)}

echo ""
echo "Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo ""

# Create resource group
echo "Step 1: Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "✓ Resource group created"

# Deploy infrastructure using Bicep
echo ""
echo "Step 2: Deploying Azure infrastructure..."
cd infrastructure
az deployment group create \
    --resource-group $RESOURCE_GROUP \
    --template-file main.bicep \
    --parameters jwtSecretKey="$JWT_SECRET_KEY"

echo "✓ Infrastructure deployed"

# Get deployment outputs
echo ""
echo "Step 3: Getting deployment outputs..."
FUNCTION_APP_NAME=$(az deployment group show \
    --resource-group $RESOURCE_GROUP \
    --name main \
    --query properties.outputs.functionAppName.value \
    --output tsv)

FUNCTION_APP_URL=$(az deployment group show \
    --resource-group $RESOURCE_GROUP \
    --name main \
    --query properties.outputs.functionAppUrl.value \
    --output tsv)

echo "  Function App Name: $FUNCTION_APP_NAME"
echo "  Function App URL: $FUNCTION_APP_URL"

cd ..

# Install Python dependencies
echo ""
echo "Step 4: Installing Python dependencies..."
pip install -r requirements.txt --target .python_packages/lib/site-packages

echo "✓ Dependencies installed"

# Deploy function app
echo ""
echo "Step 5: Deploying Azure Functions..."
func azure functionapp publish $FUNCTION_APP_NAME --python

echo "✓ Functions deployed"

# Display completion message
echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo "Your CDL DeFi backend is now deployed to Azure!"
echo ""
echo "API Endpoint: $FUNCTION_APP_URL/api"
echo ""
echo "Next steps:"
echo "1. Configure your email domain in Azure Communication Services"
echo "2. Update your frontend .env file with the API endpoint"
echo "3. Test the API endpoints"
echo ""
echo "To view logs:"
echo "  az monitor app-insights query --app $FUNCTION_APP_NAME-insights --analytics-query 'requests'"
echo ""
echo "To view function app settings:"
echo "  az functionapp config appsettings list --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
