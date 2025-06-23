#!/bin/bash

PROJECT_ID=$(gcloud config list --format 'value(core.project)' 2>/dev/null)
REGION=$(cat .env | grep GOOGLE_CLOUD_LOCATION | sed 's|GOOGLE_CLOUD_LOCATION=||g')
SERVICE_NAME=api

SERVICE_ACCOUNT=$(gcloud run services describe $SERVICE_NAME \
                     --region $REGION \
                     --format='value(spec.template.spec.serviceAccountName)')

echo "PROJECT_ID=$PROJECT_ID"
echo "REGION=$REGION"
echo "SERVICE_NAME=$SERVICE_NAME"
echo "SERVICE_ACCOUNT=$SERVICE_ACCOUNT"

echo "Adding permission to enable access to secrets"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
