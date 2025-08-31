#!/bin/bash

# AWS S3 Static Website Deployment Script
# Make sure AWS CLI is installed and configured with your credentials

BUCKET_NAME="skyview-xc-team"
REGION="us-east-1"
CLOUDFRONT_DISTRIBUTION_ID="E31P5TNTOVU0J5"
CLOUDFRONT_DOMAIN="d9mvm5wuesb39.cloudfront.net"

echo "🚀 Deploying to AWS S3..."

# Create bucket if it doesn't exist
aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null || {
    echo "Creating bucket $BUCKET_NAME..."
    aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
    
    # Enable static website hosting
    aws s3 website "s3://$BUCKET_NAME/" --index-document index.html --error-document error.html
    
    # Set bucket policy for public read access
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
            }
        ]
    }'
}

# Sync newsletters folder
aws s3 sync newsletters/ "s3://$BUCKET_NAME/newsletters/" --delete

# Copy index.html if it exists
if [ -f "index.html" ]; then
    aws s3 cp index.html "s3://$BUCKET_NAME/index.html"
fi

# Invalidate CloudFront cache to show new content immediately
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*" > /dev/null

echo "✅ Deployment complete!"
echo "🌐 S3 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "🔒 HTTPS Website URL: https://$CLOUDFRONT_DOMAIN"
echo "📄 HTTPS Newsletter URL: https://$CLOUDFRONT_DOMAIN/newsletters/week4-newsletter.html"
echo ""
echo "⚡ Note: CloudFront may take 5-15 minutes to fully propagate changes globally."