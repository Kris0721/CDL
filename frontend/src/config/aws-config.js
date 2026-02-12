/**
 * AWS Configuration for CDL DeFi Frontend
 * Configuration for AWS services including API Gateway, Cognito, and S3
 */

export const awsConfig = {
    // AWS API Gateway endpoint
    apiEndpoint: import.meta.env.VITE_AWS_API_URL || 'http://localhost:3000',

    // AWS region
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',

    // Cognito configuration (if using Cognito for auth)
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
    identityPoolId: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID || '',

    // S3 bucket for KYC documents
    s3Bucket: import.meta.env.VITE_S3_BUCKET || ''
};

export default awsConfig;
