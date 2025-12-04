#!/bin/bash

# DeFi Lending Platform Backend Deployment Script

set -e

echo "========================================="
echo "DeFi Lending Platform - Backend Deployment"
echo "========================================="

# Check if AWS SAM CLI is installed
if ! command -v sam &> /dev/null; then
    echo "Error: AWS SAM CLI is not installed."
    echo "Please install it from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "Error: AWS CLI is not configured."
    echo "Please run: aws configure"
    exit 1
fi

echo ""
echo "Step 1: Installing Python dependencies for Lambda layer..."
cd layers/common
pip install -r python/requirements.txt -t python/ --upgrade
cd ../..

echo ""
echo "Step 2: Validating SAM template..."
sam validate

echo ""
echo "Step 3: Building SAM application..."
sam build

echo ""
echo "Step 4: Deploying to AWS..."
echo "Note: You will be prompted to confirm the deployment."
sam deploy --guided

echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Verify your SES email address in AWS Console"
echo "2. Update your frontend .env file with the API endpoint"
echo "3. Test the API endpoints"
echo ""
echo "To get the API URL, run:"
echo "aws cloudformation describe-stacks --stack-name defi-lending-backend --query 'Stacks[0].Outputs[?OutputKey==\`ApiUrl\`].OutputValue' --output text"
