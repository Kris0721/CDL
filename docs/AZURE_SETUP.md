# Azure Setup Guide for CDL DeFi Lending Platform

> [!WARNING]
> **DEPRECATED**: This Azure backend implementation has been archived. The project now uses AWS as the primary backend infrastructure. Please refer to [AWS_SETUP.md](./AWS_SETUP.md) for current deployment instructions.

This guide will walk you through setting up the CDL DeFi Lending Platform on Microsoft Azure.

## Prerequisites

- Azure account with an active subscription
- Azure CLI installed
- Azure Functions Core Tools v4 installed
- Python 3.11+ installed
- Git installed

## Step 1: Azure Account Setup

### Create an Azure Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign up for a free account (includes $200 credit for 30 days)
3. Complete the verification process

### Install Azure CLI

**Windows:**
```powershell
winget install Microsoft.AzureCLI
```

**macOS:**
```bash
brew install azure-cli
```

**Linux (Ubuntu/Debian):**
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Login to Azure

```bash
az login
```

This will open a browser window for authentication.

### Verify Login

```bash
az account show
```

## Step 2: Install Azure Functions Core Tools

**Windows:**
```powershell
npm install -g azure-functions-core-tools@4 --unsafe-perm true
```

**macOS:**
```bash
brew tap azure/functions
brew install azure-functions-core-tools@4
```

**Linux:**
```bash
wget -q https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
sudo apt-get update
sudo apt-get install azure-functions-core-tools-4
```

### Verify Installation

```bash
func --version
```

Should output version 4.x.x

## Step 3: Clone and Setup Project

```bash
# Clone repository
git clone <repository-url>
cd CDL

# Navigate to Azure backend
cd backend-azure

# Install Python dependencies
pip install -r requirements.txt
```

## Step 4: Deploy Infrastructure

### Option 1: Automated Deployment (Recommended)

**Windows (PowerShell):**
```powershell
.\deploy-azure.ps1
```

**Linux/macOS (Bash):**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

The script will:
1. Create a resource group
2. Deploy all Azure resources using Bicep
3. Deploy the Azure Functions app
4. Configure all necessary settings

### Option 2: Manual Deployment

#### Create Resource Group

```bash
az group create --name cdl-defi-rg --location eastus
```

#### Deploy Infrastructure

```bash
cd infrastructure

# Generate a JWT secret key
JWT_SECRET=$(openssl rand -base64 32)

# Deploy using Bicep
az deployment group create \
    --resource-group cdl-defi-rg \
    --template-file main.bicep \
    --parameters jwtSecretKey="$JWT_SECRET"
```

#### Get Deployment Outputs

```bash
# Get Function App name
FUNCTION_APP_NAME=$(az deployment group show \
    --resource-group cdl-defi-rg \
    --name main \
    --query properties.outputs.functionAppName.value \
    --output tsv)

echo "Function App Name: $FUNCTION_APP_NAME"

# Get Function App URL
FUNCTION_APP_URL=$(az deployment group show \
    --resource-group cdl-defi-rg \
    --name main \
    --query properties.outputs.functionAppUrl.value \
    --output tsv)

echo "Function App URL: $FUNCTION_APP_URL"
```

#### Deploy Functions

```bash
cd ..
func azure functionapp publish $FUNCTION_APP_NAME --python
```

## Step 5: Configure Azure Communication Services

Azure Communication Services is used for sending emails.

### Create Email Domain

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Communication Service resource
3. Go to "Email" → "Domains"
4. Add a custom domain or use the free Azure subdomain
5. Verify domain ownership (if using custom domain)

### Configure Sender Address

1. Go to "Email" → "Sender addresses"
2. Add `noreply@your-domain.com`
3. Update the Function App setting:

```bash
az functionapp config appsettings set \
    --name $FUNCTION_APP_NAME \
    --resource-group cdl-defi-rg \
    --settings EMAIL_FROM_ADDRESS="noreply@your-domain.com"
```

## Step 6: Configure Frontend

### Update Environment Variables

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Edit `.env` with your Azure endpoints:
```env
VITE_AZURE_API_URL=https://your-function-app.azurewebsites.net/api
VITE_AZURE_REGION=eastus
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
```

### Install and Run Frontend

```bash
npm install
npm run dev
```

## Step 7: Verify Deployment

### Test API Endpoints

```bash
# Test health endpoint (if implemented)
curl https://your-function-app.azurewebsites.net/api/health

# Test registration
curl -X POST https://your-function-app.azurewebsites.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!",
    "fullName": "Test User",
    "role": "borrower"
  }'
```

### View Logs

```bash
# Stream logs in real-time
func azure functionapp logstream $FUNCTION_APP_NAME

# Or view in Application Insights
az monitor app-insights query \
    --app ${FUNCTION_APP_NAME}-insights \
    --analytics-query 'requests | limit 50'
```

## Step 8: Monitor and Manage

### View Resources

```bash
# List all resources in the resource group
az resource list --resource-group cdl-defi-rg --output table
```

### View Function App Settings

```bash
az functionapp config appsettings list \
    --name $FUNCTION_APP_NAME \
    --resource-group cdl-defi-rg
```

### View Cosmos DB

```bash
# Get Cosmos DB account details
az cosmosdb show \
    --name <cosmos-account-name> \
    --resource-group cdl-defi-rg
```

### View Blob Storage

```bash
# List storage accounts
az storage account list \
    --resource-group cdl-defi-rg \
    --output table
```

## Troubleshooting

### Function App Not Starting

1. Check logs:
```bash
func azure functionapp logstream $FUNCTION_APP_NAME
```

2. Verify Python version:
```bash
az functionapp config show \
    --name $FUNCTION_APP_NAME \
    --resource-group cdl-defi-rg \
    --query linuxFxVersion
```

### Database Connection Issues

1. Verify Cosmos DB endpoint:
```bash
az cosmosdb show \
    --name <cosmos-account-name> \
    --resource-group cdl-defi-rg \
    --query documentEndpoint
```

2. Check Function App has correct connection string

### Email Not Sending

1. Verify Communication Service is configured
2. Check domain verification status
3. Review Application Insights for errors

### CORS Issues

Update CORS settings:
```bash
az functionapp cors add \
    --name $FUNCTION_APP_NAME \
    --resource-group cdl-defi-rg \
    --allowed-origins "http://localhost:5173" "https://your-frontend-domain.com"
```

## Cost Management

### Monitor Costs

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to "Cost Management + Billing"
3. View cost analysis for your subscription

### Set Budget Alerts

```bash
# Create a budget
az consumption budget create \
    --budget-name cdl-monthly-budget \
    --amount 100 \
    --time-grain Monthly \
    --start-date $(date +%Y-%m-01) \
    --end-date $(date -d "+1 year" +%Y-%m-01)
```

### Optimize Costs

- Use Consumption Plan for Functions (pay-per-execution)
- Use Cosmos DB Serverless for development
- Use Hot tier for Blob Storage only when needed
- Configure Application Insights sampling

## Security Best Practices

### Enable Managed Identity

```bash
az functionapp identity assign \
    --name $FUNCTION_APP_NAME \
    --resource-group cdl-defi-rg
```

### Store Secrets in Key Vault

```bash
# Create Key Vault
az keyvault create \
    --name cdl-keyvault \
    --resource-group cdl-defi-rg \
    --location eastus

# Add secret
az keyvault secret set \
    --vault-name cdl-keyvault \
    --name JWT-SECRET-KEY \
    --value "your-secret-key"
```

### Enable HTTPS Only

```bash
az functionapp update \
    --name $FUNCTION_APP_NAME \
    --resource-group cdl-defi-rg \
    --set httpsOnly=true
```

## Cleanup

To delete all resources:

```bash
az group delete --name cdl-defi-rg --yes --no-wait
```

> **Warning**: This will permanently delete all resources in the resource group!

## Next Steps

1. Deploy smart contracts to blockchain
2. Configure CI/CD pipeline
3. Set up monitoring and alerts
4. Implement backup strategy
5. Configure custom domain for frontend

## Resources

- [Azure Functions Documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [Azure Communication Services Documentation](https://docs.microsoft.com/en-us/azure/communication-services/)
- [Azure Bicep Documentation](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)

## Support

For issues:
- Check Application Insights logs
- Review Azure Function logs
- Consult Azure documentation
- Contact support team

---

**Successfully migrated from AWS to Azure!** 🎉
