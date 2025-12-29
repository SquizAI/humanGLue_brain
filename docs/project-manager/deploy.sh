#!/bin/bash

# Calculate SHA1 of the file
SHA=$(shasum _site/index.html | awk '{print $1}')

# Create deployment with file manifest
DEPLOY_JSON=$(cat <<JSON
{
  "files": {
    "/index.html": "$SHA"
  }
}
JSON
)

# Create deployment
DEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $NETLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DEPLOY_JSON" \
  "https://api.netlify.com/api/v1/sites/edaf286f-8f92-430a-a989-cc0a67fd1d6a/deploys")

DEPLOY_ID=$(echo $DEPLOY_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Deploy ID: $DEPLOY_ID"

# Upload the file
curl -X PUT \
  -H "Content-Type: application/octet-stream" \
  -H "Authorization: Bearer $NETLIFY_API_TOKEN" \
  --data-binary @_site/index.html \
  "https://api.netlify.com/api/v1/deploys/$DEPLOY_ID/files/index.html"

# Finalize deployment
curl -X POST \
  -H "Authorization: Bearer $NETLIFY_API_TOKEN" \
  "https://api.netlify.com/api/v1/sites/edaf286f-8f92-430a-a989-cc0a67fd1d6a/deploys/$DEPLOY_ID/lock"

echo "Deployment complete: https://hg-project-manager.netlify.app"
