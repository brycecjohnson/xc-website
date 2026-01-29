#!/bin/bash
# CloudWatch Monitoring Setup for Skyview XC Website
#
# Creates a CloudWatch dashboard and alarms for monitoring
# the static site hosted on CloudFront + S3.
#
# Prerequisites:
#   - AWS CLI configured with appropriate permissions
#   - CloudFront distribution ID set in environment or .env
#
# Usage:
#   ./scripts/setup-monitoring.sh
#
# Cost: ~$0.00/month (free tier covers dashboards + basic alarms)

set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  source .env
fi

# Configuration
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-E31P5TNTOVU0J5}"
BUCKET_NAME="${BUCKET_NAME:-skyview-xc-team}"
REGION="${AWS_REGION:-us-east-1}"
DASHBOARD_NAME="SkyviewXC-Site-Health"
ALARM_PREFIX="SkyviewXC"

echo "=== CloudWatch Monitoring Setup ==="
echo "Distribution: ${DISTRIBUTION_ID}"
echo "Bucket: ${BUCKET_NAME}"
echo "Region: ${REGION}"
echo ""

# Create CloudWatch Dashboard
echo "Creating CloudWatch dashboard: ${DASHBOARD_NAME}..."

DASHBOARD_BODY=$(cat <<'DASHBOARD'
{
  "widgets": [
    {
      "type": "text",
      "x": 0, "y": 0, "width": 24, "height": 1,
      "properties": {
        "markdown": "# Skyview XC Website - Site Health Dashboard"
      }
    },
    {
      "type": "metric",
      "x": 0, "y": 1, "width": 12, "height": 6,
      "properties": {
        "title": "CloudFront Requests",
        "metrics": [
          ["AWS/CloudFront", "Requests", "DistributionId", "DIST_ID", "Region", "Global", { "stat": "Sum", "period": 3600 }]
        ],
        "view": "timeSeries",
        "region": "us-east-1",
        "period": 3600
      }
    },
    {
      "type": "metric",
      "x": 12, "y": 1, "width": 12, "height": 6,
      "properties": {
        "title": "Error Rate (4xx + 5xx)",
        "metrics": [
          ["AWS/CloudFront", "4xxErrorRate", "DistributionId", "DIST_ID", "Region", "Global", { "stat": "Average", "period": 3600, "color": "#ff9900" }],
          ["AWS/CloudFront", "5xxErrorRate", "DistributionId", "DIST_ID", "Region", "Global", { "stat": "Average", "period": 3600, "color": "#d13212" }]
        ],
        "view": "timeSeries",
        "region": "us-east-1",
        "yAxis": { "left": { "min": 0, "max": 10 } }
      }
    },
    {
      "type": "metric",
      "x": 0, "y": 7, "width": 12, "height": 6,
      "properties": {
        "title": "Bytes Downloaded",
        "metrics": [
          ["AWS/CloudFront", "BytesDownloaded", "DistributionId", "DIST_ID", "Region", "Global", { "stat": "Sum", "period": 3600 }]
        ],
        "view": "timeSeries",
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "x": 12, "y": 7, "width": 12, "height": 6,
      "properties": {
        "title": "Cache Hit Rate",
        "metrics": [
          ["AWS/CloudFront", "CacheHitRate", "DistributionId", "DIST_ID", "Region", "Global", { "stat": "Average", "period": 3600 }]
        ],
        "view": "timeSeries",
        "region": "us-east-1",
        "yAxis": { "left": { "min": 0, "max": 100 } }
      }
    },
    {
      "type": "metric",
      "x": 0, "y": 13, "width": 8, "height": 6,
      "properties": {
        "title": "S3 Bucket Size",
        "metrics": [
          ["AWS/S3", "BucketSizeBytes", "BucketName", "BUCKET", "StorageType", "StandardStorage", { "stat": "Average", "period": 86400 }]
        ],
        "view": "singleValue",
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "x": 8, "y": 13, "width": 8, "height": 6,
      "properties": {
        "title": "S3 Object Count",
        "metrics": [
          ["AWS/S3", "NumberOfObjects", "BucketName", "BUCKET", "StorageType", "AllStorageTypes", { "stat": "Average", "period": 86400 }]
        ],
        "view": "singleValue",
        "region": "us-east-1"
      }
    },
    {
      "type": "metric",
      "x": 16, "y": 13, "width": 8, "height": 6,
      "properties": {
        "title": "Total Requests (24h)",
        "metrics": [
          ["AWS/CloudFront", "Requests", "DistributionId", "DIST_ID", "Region", "Global", { "stat": "Sum", "period": 86400 }]
        ],
        "view": "singleValue",
        "region": "us-east-1"
      }
    }
  ]
}
DASHBOARD
)

# Replace placeholders with actual values
DASHBOARD_BODY=$(echo "$DASHBOARD_BODY" | sed "s/DIST_ID/${DISTRIBUTION_ID}/g" | sed "s/BUCKET/${BUCKET_NAME}/g")

aws cloudwatch put-dashboard \
  --dashboard-name "${DASHBOARD_NAME}" \
  --dashboard-body "${DASHBOARD_BODY}" \
  --region "${REGION}"

echo "Dashboard created: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=${DASHBOARD_NAME}"

# Create CloudWatch Alarms
echo ""
echo "Creating CloudWatch alarms..."

# Alarm: High 5xx Error Rate
aws cloudwatch put-metric-alarm \
  --alarm-name "${ALARM_PREFIX}-High5xxErrorRate" \
  --alarm-description "CloudFront 5xx error rate exceeds 5% for 5 minutes" \
  --namespace "AWS/CloudFront" \
  --metric-name "5xxErrorRate" \
  --dimensions "Name=DistributionId,Value=${DISTRIBUTION_ID}" "Name=Region,Value=Global" \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --treat-missing-data notBreaching \
  --region "${REGION}"

echo "  Created: ${ALARM_PREFIX}-High5xxErrorRate"

# Alarm: High 4xx Error Rate
aws cloudwatch put-metric-alarm \
  --alarm-name "${ALARM_PREFIX}-High4xxErrorRate" \
  --alarm-description "CloudFront 4xx error rate exceeds 10% for 10 minutes" \
  --namespace "AWS/CloudFront" \
  --metric-name "4xxErrorRate" \
  --dimensions "Name=DistributionId,Value=${DISTRIBUTION_ID}" "Name=Region,Value=Global" \
  --statistic Average \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --treat-missing-data notBreaching \
  --region "${REGION}"

echo "  Created: ${ALARM_PREFIX}-High4xxErrorRate"

# Alarm: Low Cache Hit Rate
aws cloudwatch put-metric-alarm \
  --alarm-name "${ALARM_PREFIX}-LowCacheHitRate" \
  --alarm-description "CloudFront cache hit rate below 80% for 1 hour" \
  --namespace "AWS/CloudFront" \
  --metric-name "CacheHitRate" \
  --dimensions "Name=DistributionId,Value=${DISTRIBUTION_ID}" "Name=Region,Value=Global" \
  --statistic Average \
  --period 3600 \
  --threshold 80 \
  --comparison-operator LessThanThreshold \
  --evaluation-periods 1 \
  --treat-missing-data notBreaching \
  --region "${REGION}"

echo "  Created: ${ALARM_PREFIX}-LowCacheHitRate"

echo ""
echo "=== Monitoring Setup Complete ==="
echo ""
echo "Dashboard: https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:name=${DASHBOARD_NAME}"
echo ""
echo "Alarms created:"
echo "  - ${ALARM_PREFIX}-High5xxErrorRate (>5% for 5 min)"
echo "  - ${ALARM_PREFIX}-High4xxErrorRate (>10% for 10 min)"
echo "  - ${ALARM_PREFIX}-LowCacheHitRate (<80% for 1 hour)"
echo ""
echo "Cost impact: Free (within CloudWatch free tier)"
