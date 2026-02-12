# Azure Deployment Script for CDL DeFi Lending Platform (PowerShell)
# This script deploys the backend to Azure

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CDL DeFi - Azure Deployment Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if Azure CLI is installed
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Azure CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}

# Check if Azure Functions Core Tools is installed
if (!(Get-Command func -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Azure Functions Core Tools is not installed." -ForegroundColor Red
    Write-Host "Please install it from: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local"
    exit 1
}

# Check if logged in to Azure
Write-Host "Checking Azure login status..."
try {
    az account show | Out-Null
    Write-Host "✓ Azure CLI is configured" -ForegroundColor Green
} catch {
    Write-Host "Error: Not logged in to Azure." -ForegroundColor Red
    Write-Host "Please run: az login"
    exit 1
}

# Configuration
$RESOURCE_GROUP = "cdl-defi-rg"
$LOCATION = "eastus"
$JWT_SECRET_KEY = if ($env:JWT_SECRET_KEY) { $env:JWT_SECRET_KEY } else { 
    # Generate random secret key
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    [Convert]::ToBase64String($bytes)
}

Write-Host ""
Write-Host "Configuration:"
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Location: $LOCATION"
Write-Host ""

# Create resource group
Write-Host "Step 1: Creating resource group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION
Write-Host "✓ Resource group created" -ForegroundColor Green

# Deploy infrastructure using Bicep
Write-Host ""
Write-Host "Step 2: Deploying Azure infrastructure..." -ForegroundColor Yellow
Set-Location infrastructure
az deployment group create `
    --resource-group $RESOURCE_GROUP `
    --template-file main.bicep `
    --parameters jwtSecretKey="$JWT_SECRET_KEY"

Write-Host "✓ Infrastructure deployed" -ForegroundColor Green

# Get deployment outputs
Write-Host ""
Write-Host "Step 3: Getting deployment outputs..." -ForegroundColor Yellow
$FUNCTION_APP_NAME = az deployment group show `
    --resource-group $RESOURCE_GROUP `
    --name main `
    --query properties.outputs.functionAppName.value `
    --output tsv

$FUNCTION_APP_URL = az deployment group show `
    --resource-group $RESOURCE_GROUP `
    --name main `
    --query properties.outputs.functionAppUrl.value `
    --output tsv

Write-Host "  Function App Name: $FUNCTION_APP_NAME"
Write-Host "  Function App URL: $FUNCTION_APP_URL"

Set-Location ..

# Install Python dependencies
Write-Host ""
Write-Host "Step 4: Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --target .python_packages/lib/site-packages
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Deploy function app
Write-Host ""
Write-Host "Step 5: Deploying Azure Functions..." -ForegroundColor Yellow
func azure functionapp publish $FUNCTION_APP_NAME --python
Write-Host "✓ Functions deployed" -ForegroundColor Green

# Display completion message
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your CDL DeFi backend is now deployed to Azure!" -ForegroundColor Green
Write-Host ""
Write-Host "API Endpoint: $FUNCTION_APP_URL/api"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Configure your email domain in Azure Communication Services"
Write-Host "2. Update your frontend .env file with the API endpoint"
Write-Host "3. Test the API endpoints"
Write-Host ""
Write-Host "To view logs:"
Write-Host "  az monitor app-insights query --app $FUNCTION_APP_NAME-insights --analytics-query 'requests'"
Write-Host ""
Write-Host "To view function app settings:"
Write-Host "  az functionapp config appsettings list --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP"
Write-Host ""
