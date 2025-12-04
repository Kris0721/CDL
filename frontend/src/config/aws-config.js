export const awsConfig = {
    region: import.meta.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: import.meta.env.REACT_APP_COGNITO_USER_POOL_ID || '',
    userPoolWebClientId: import.meta.env.REACT_APP_COGNITO_CLIENT_ID || '',
    identityPoolId: import.meta.env.REACT_APP_COGNITO_IDENTITY_POOL_ID || '',
    s3Bucket: import.meta.env.REACT_APP_S3_BUCKET || ''
};

export default awsConfig;
