# 🚀 AWS Lambda Deployment Guide

## Overview

Deploy your .NET 8 backend to AWS Lambda and React frontend to S3 + CloudFront.

---

## Prerequisites

1. **AWS Account** → [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI** installed → `aws --version`
3. **IAM User** with programmatic access
4. **SQL Server** (RDS or Azure SQL)

---

## Step 1: Install AWS CLI

### Windows
```powershell
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi
# Or use winget:
winget install Amazon.AWSCLI
```

### Mac
```bash
brew install awscli
```

### Configure
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: ap-south-1 (Mumbai - closest to Kerala)
# Output format: json
```

---

## Step 2: Create IAM User (One-time setup)

1. AWS Console → IAM → Users → Add user
2. **User name:** `expensesplit-deploy`
3. ✅ **Access type:** Programmatic access
4. Attach policies directly → **Create policy**

Paste this JSON (from `infrastructure/policy.json`):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:*",
        "apigateway:*",
        "s3:*",
        "cloudfront:*",
        "logs:*",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Name policy: `ExpenseSplitDeployPolicy`
6. Attach to user
7. **Save Access Key ID and Secret** (you won't see Secret again!)

---

## Step 3: Prepare Your Backend for Lambda

### Install Lambda Tools
```bash
dotnet tool install -g Amazon.Lambda.Tools
dotnet tool install -g Amazon.Lambda.TestTool-8.0
```

### Add Lambda NuGet Package
In your `.csproj` file, add:
```xml
<PackageReference Include="Amazon.Lambda.AspNetCoreServer.Hosting" Version="1.7.0" />
```

### Update Program.cs
```csharp
using Amazon.Lambda.AspNetCoreServer;

var builder = WebApplication.CreateBuilder(args);

// Add Lambda support
builder.Services.AddAWSLambdaHosting(LambdaEventSource.HttpApi);

// ... rest of your existing code
```

### Create Lambda Entry Point
Create `LambdaEntryPoint.cs`:
```csharp
using Amazon.Lambda.AspNetCoreServer;
using Amazon.Lambda.Core;

namespace ExpenseSplit.Api;

public class LambdaEntryPoint : APIGatewayHttpApiV2ProxyFunction
{
    protected override void Init(IWebHostBuilder builder)
    {
        builder.UseStartup<Program>();
    }
}
```

### Update appsettings.Production.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=your-rds-endpoint;Database=ExpenseSplitDb;User Id=admin;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  },
  "AWS": {
    "Region": "ap-south-1"
  }
}
```

---

## Step 4: Deploy Backend to Lambda

### Method A: Using AWS SAM (Recommended)

```bash
# Navigate to infrastructure folder
cd infrastructure

# Build
cd ../backend/ExpenseSplit.Api
sam build

# Deploy (first time - guided)
sam deploy --guided

# Answer prompts:
# Stack Name: expensesplit-pro
# AWS Region: ap-south-1
# Confirm changeset: Y
# Deploy: Y

# Subsequent deployments:
sam deploy
```

### Method B: Manual Lambda Deployment

```bash
# Package your app
cd backend/ExpenseSplit.Api
dotnet lambda package --configuration Release

# This creates: bin/Release/net8.0/ExpenseSplit.Api.zip

# Create Lambda function (first time)
aws lambda create-function \
  --function-name ExpenseSplitApi \
  --runtime dotnet8 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler ExpenseSplit.Api \
  --zip-file fileb://bin/Release/net8.0/ExpenseSplit.Api.zip \
  --memory-size 512 \
  --timeout 30

# Update function code (subsequent)
aws lambda update-function-code \
  --function-name ExpenseSplitApi \
  --zip-file fileb://bin/Release/net8.0/ExpenseSplit.Api.zip
```

### Create API Gateway
1. AWS Console → API Gateway → Create API → HTTP API
2. Integration type: Lambda
3. Select your `ExpenseSplitApi` function
4. CORS: Enable ✅
5. Deploy stage: `prod`
6. Note the **Invoke URL**

---

## Step 5: Setup RDS SQL Server (Database)

1. AWS Console → RDS → Create database
2. Engine: **SQL Server Express**
3. Template: Free tier (if eligible)
4. DB instance: `expensesplit-db`
5. Master username: `admin`
6. Master password: (save this!)
7. VPC: Default
8. Public access: **Yes** (for development)
9. Security group: Allow inbound on port **1433** from your IP
10. Create database

### Update Connection String
```bash
# Get RDS endpoint
aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address'

# Update appsettings.Production.json
# Server=YOUR_RDS_ENDPOINT;Database=ExpenseSplitDb;...
```

### Run Migrations on RDS
```bash
cd backend/ExpenseSplit.Api

# Set environment variable temporarily
$env:ASPNETCORE_ENVIRONMENT="Production"

# Run migrations
dotnet ef database update
```

---

## Step 6: Deploy Frontend to S3 + CloudFront

### Create S3 Bucket
```bash
# Create bucket (must be globally unique)
aws s3 mb s3://expensesplit-pro-frontend-uvais

# Enable static website hosting
aws s3 website s3://expensesplit-pro-frontend-uvais --index-document index.html --error-document index.html

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket expensesplit-pro-frontend-uvais --policy file://infrastructure/s3-policy.json
```

`s3-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::expensesplit-pro-frontend-uvais/*"
    }
  ]
}
```

### Build & Deploy
```bash
cd frontend

# Update API URL in .env.production
echo "REACT_APP_API_URL=https://your-api-gateway-url" > .env.production

# Build
npm run build

# Sync to S3
aws s3 sync build/ s3://expensesplit-pro-frontend-uvais --delete
```

### Setup CloudFront CDN
1. AWS Console → CloudFront → Create Distribution
2. Origin domain: Select your S3 bucket
3. Origin access: Public
4. Viewer protocol policy: **Redirect HTTP to HTTPS**
5. Allowed HTTP methods: GET, HEAD, OPTIONS
6. Cache policy: CachingOptimized
7. Price class: Use only North America and Europe (cheaper)
8. Alternate domain names: `expensesplit.uvais.dev` (optional)
9. SSL certificate: Request from ACM (if using custom domain)
10. Create distribution

**Important:** Add error pages:
- HTTP error code: 403, 404
- Response page path: `/index.html`
- HTTP response code: 200

### Invalidate Cache After Deploy
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Step 7: Configure GitHub Secrets (For CI/CD)

Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Your IAM user's Access Key |
| `AWS_SECRET_ACCESS_KEY` | Your IAM user's Secret Key |
| `S3_BUCKET_NAME` | `expensesplit-pro-frontend-uvais` |
| `CLOUDFRONT_DISTRIBUTION_ID` | From CloudFront console |
| `REACT_APP_API_URL` | `https://your-api-gateway-url` |
| `DB_CONNECTION_STRING` | RDS connection string |

---

## 💰 Cost Estimation (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| AWS Lambda | 1M requests free | ~₹0 (low traffic) |
| API Gateway | 1M requests free | ~₹0 |
| S3 | 5GB free | ~₹10 |
| CloudFront | 50GB free | ~₹0-50 |
| RDS SQL Server | Not in free tier | ~₹1,500-2,500 |
| **Total** | | **~₹1,500-2,500/month** |

**Money-saving tip:** Use RDS only during interviews, stop instance when not needed.

---

## ✅ Post-Deployment Checklist

- [ ] API Gateway URL returns health check: `GET /api/health`
- [ ] Frontend loads without 403 errors
- [ ] CloudFront URL shows React app
- [ ] CORS works (frontend can call backend)
- [ ] Database migrations ran successfully
- [ ] GitHub Actions deploys on push
- [ ] Custom domain points to CloudFront (optional)

---

## 🆘 Troubleshooting

### "Internal Server Error" from Lambda
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/ExpenseSplitApi --follow
```

### "CORS error" in browser
1. API Gateway → CORS → Enable
2. Add headers: `Content-Type, Authorization`
3. Redeploy API Gateway

### "403 Forbidden" from S3
```bash
# Check bucket policy
aws s3api get-bucket-policy --bucket expensesplit-pro-frontend-uvais

# Re-apply if needed
aws s3api put-bucket-policy --bucket expensesplit-pro-frontend-uvais --policy file://infrastructure/s3-policy.json
```

### "404 on page refresh" in React
CloudFront → Error pages → Add 404 → Return 200 with `/index.html`

---

## 📚 Next Steps

1. **Add custom domain** via Route 53
2. **Enable HTTPS** with ACM certificate
3. **Setup CloudWatch alarms** for errors
4. **Add AWS WAF** for security
5. **Enable CloudTrail** for audit logging

---

**Questions?** Open an issue or email uvaise.basheer@gmail.com
