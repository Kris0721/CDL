# AWS Setup Guide for CDL DeFi Lending Platform

This guide will walk you through setting up the CDL DeFi Lending Platform on Amazon Web Services (AWS).

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- AWS SAM CLI installed
- Python 3.11+ installed
- Git installed

## Step 1: AWS Account Setup

### Create an AWS Account

1. Go to [AWS Console](https://aws.amazon.com)
2. Sign up for a new account (includes free tier for 12 months)
3. Complete the verification process

### Install AWS CLI

**Windows:**
```powershell
winget install Amazon.AWSCLI
```

**macOS:**
```bash
brew install awscli
```

**Linux (Ubuntu/Debian):**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Configure AWS CLI

```bash
aws configure
```

You'll be prompted for:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region**: Your preferred region (e.g., `us-east-1`)
- **Default output format**: `json` (recommended)

### Verify Configuration

```bash
aws sts get-caller-identity
```

## Step 2: Install AWS SAM CLI

**Windows:**
```powershell
winget install Amazon.SAM-CLI
```

**macOS:**
```bash
brew install aws-sam-cli
```

**Linux:**
```bash
wget https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip
unzip aws-sam-cli-linux-x86_64.zip -d sam-installation
sudo ./sam-installation/install
```

### Verify Installation

```bash
sam --version
```

Should output SAM CLI version 1.x.x

## Step 3: Clone and Setup Project

```bash
# Clone repository
git clone <repository-url>
cd CDL

# Navigate to AWS backend
cd backend

# Install Python dependencies for Lambda layer
cd layers/common
pip install -r python/requirements.txt -t python/
cd ../..
```

## Step 4: Deploy Infrastructure

### Option 1: Automated Deployment (Recommended)

**Linux/macOS:**
```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. Validate the SAM template
2. Build the application
3. Deploy all AWS resources
4. Output the API Gateway URL

### Option 2: Manual Deployment

#### Build the Application

```bash
sam build
```

#### Deploy (First Time - Guided Mode)

```bash
sam deploy --guided
```

You'll be prompted for:
- **Stack Name**: `cdl-defi-backend` (or your choice)
- **AWS Region**: Your preferred region (e.g., `us-east-1`)
- **JWTSecretKey**: Your JWT secret key (keep this secure!)
- **SESFromEmail**: Email address for sending notifications (e.g., `noreply@yourdomain.com`)
- **Confirm changes before deploy**: Y
- **Allow SAM CLI IAM role creation**: Y
- **Save arguments to configuration file**: Y

#### Deploy (Subsequent Deployments)

```bash
sam deploy
```

#### Get Deployment Outputs

```bash
aws cloudformation describe-stacks \
    --stack-name cdl-defi-backend \
    --query 'Stacks[0].Outputs'
```

This will show you:
- API Gateway URL
- DynamoDB table names
- S3 bucket name

## Step 5: Configure Amazon SES

Amazon SES is used for sending emails (OTP, notifications, etc.).

### Verify Email Address

1. Go to [SES Console](https://console.aws.amazon.com/ses/)
2. Navigate to "Verified identities"
3. Click "Create identity"
4. Select "Email address"
5. Enter your sender email (e.g., `noreply@yourdomain.com`)
6. Click "Create identity"
7. Check your email and click the verification link

### Request Production Access (Optional)

By default, SES is in sandbox mode (can only send to verified addresses).

For production:
1. In SES Console, click "Account dashboard"
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for AWS approval (usually 24-48 hours)

### Configure SPF and DKIM (Production)

For better email deliverability:
1. In SES Console, go to your verified domain
2. Follow instructions to add SPF and DKIM records to your DNS

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

3. Edit `.env` with your AWS endpoints:
```env
VITE_AWS_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
```

Replace `your-api-id` with the actual API Gateway ID from the deployment outputs.

### Install and Run Frontend

```bash
npm install
npm run dev
```

## Step 7: Verify Deployment

### Test API Endpoints

```bash
# Get the API URL from CloudFormation outputs
API_URL=$(aws cloudformation describe-stacks \
    --stack-name cdl-defi-backend \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
    --output text)

echo "API URL: $API_URL"

# Test registration endpoint
curl -X POST ${API_URL}auth/register \
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
# View logs for a specific function
sam logs -n RegisterFunction --stack-name cdl-defi-backend --tail

# Or use CloudWatch Logs in AWS Console
```

## Step 8: Monitor and Manage

### View Resources

```bash
# List all resources in the stack
aws cloudformation describe-stack-resources \
    --stack-name cdl-defi-backend
```

### View DynamoDB Tables

```bash
# List tables
aws dynamodb list-tables

# Scan a table (for testing)
aws dynamodb scan --table-name DeFi-Users --max-items 10
```

### View S3 Bucket

```bash
# List objects in KYC bucket
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name cdl-defi-backend \
    --query 'Stacks[0].Outputs[?OutputKey==`KYCBucketName`].OutputValue' \
    --output text)

aws s3 ls s3://$BUCKET_NAME/
```

## Troubleshooting

### Lambda Function Errors

1. Check CloudWatch Logs:
```bash
sam logs -n FunctionName --stack-name cdl-defi-backend --tail
```

2. Verify environment variables are set correctly
3. Check IAM permissions

### DynamoDB Access Issues

1. Verify the Lambda function has DynamoDB permissions in `template.yaml`
2. Check table names match environment variables
3. Verify the table exists:
```bash
aws dynamodb describe-table --table-name DeFi-Users
```

### SES Email Not Sending

1. Verify email address in SES Console
2. Check SES sending limits (sandbox mode)
3. Review CloudWatch Logs for SES errors
4. Ensure `SES_FROM_EMAIL` environment variable is correct

### CORS Issues

The SAM template includes CORS configuration. If you still have issues:
1. Verify the `AllowOrigin` setting in `template.yaml`
2. Update to include your frontend domain
3. Redeploy with `sam deploy`

## Cost Management

### Monitor Costs

1. Go to [AWS Cost Explorer](https://console.aws.amazon.com/cost-management/home)
2. View cost breakdown by service
3. Set up billing alerts

### Set Budget Alerts

```bash
# Create a budget (example: $50/month)
aws budgets create-budget \
    --account-id $(aws sts get-caller-identity --query Account --output text) \
    --budget file://budget.json \
    --notifications-with-subscribers file://notifications.json
```

### Optimize Costs

- **DynamoDB**: Uses on-demand billing (pay per request)
- **Lambda**: Free tier includes 1M requests/month
- **S3**: Free tier includes 5GB storage
- **API Gateway**: Free tier includes 1M requests/month

## Security Best Practices

### Use AWS Secrets Manager

For production, store sensitive data in Secrets Manager:

```bash
# Create a secret
aws secretsmanager create-secret \
    --name cdl-jwt-secret \
    --secret-string "your-jwt-secret-key"

# Update Lambda to use Secrets Manager
# (requires code changes to fetch from Secrets Manager)
```

### Enable CloudTrail

```bash
# Enable CloudTrail for audit logging
aws cloudtrail create-trail \
    --name cdl-audit-trail \
    --s3-bucket-name your-cloudtrail-bucket
```

### Enable AWS WAF (Production)

Protect your API Gateway with AWS WAF:
1. Go to AWS WAF Console
2. Create a Web ACL
3. Add rules (rate limiting, IP filtering, etc.)
4. Associate with API Gateway

## Cleanup

To delete all resources:

```bash
# Delete the CloudFormation stack
aws cloudformation delete-stack --stack-name cdl-defi-backend

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name cdl-defi-backend

# Manually delete S3 bucket (if not empty)
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name cdl-defi-backend \
    --query 'Stacks[0].Outputs[?OutputKey==`KYCBucketName`].OutputValue' \
    --output text)
aws s3 rm s3://$BUCKET_NAME --recursive
aws s3 rb s3://$BUCKET_NAME
```

> [!CAUTION]
> This will permanently delete all resources including databases and stored files!

## Next Steps

1. Deploy smart contracts to blockchain
2. Configure CI/CD pipeline (GitHub Actions, AWS CodePipeline)
3. Set up monitoring and alerts (CloudWatch Alarms)
4. Implement backup strategy (DynamoDB backups, S3 versioning)
5. Configure custom domain for API Gateway
6. Set up staging and production environments

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Amazon DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Amazon S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Amazon SES Documentation](https://docs.aws.amazon.com/ses/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

## Support

For issues:
- Check CloudWatch Logs for errors
- Review AWS documentation
- Consult the backend [README.md](../backend/README.md)
- Contact support team

---

**Successfully deployed to AWS!** 🎉
