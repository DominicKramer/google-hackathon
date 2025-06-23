#!/bin/bash

TAG=$(date +%s)
PROJECT_ID=$(gcloud config list --format 'value(core.project)' 2>/dev/null)
REGION=$(cat .env | grep GOOGLE_CLOUD_LOCATION | sed 's|GOOGLE_CLOUD_LOCATION=||g')
# reads the .env and returns a string of the form
#   KEY1=KEY1:latest,KEY2=KEY2:latest,...
SECRETS=$(sed -E 's/^([^=]+)=.+$/\1=\1:latest/' .env | paste -s -d "," -)
SERVICE_NAME=api
LOCAL_IMAGE_NAME=$SERVICE_NAME:$TAG
REMOTE_IMAGE_NAME=$REGION-docker.pkg.dev/$PROJECT_ID/google-hackathon/$SERVICE_NAME:$TAG
PORT=8000

echo "Building image $LOCAL_IMAGE_NAME"
docker build --platform linux/amd64 -t $LOCAL_IMAGE_NAME .

echo "Tagging image $LOCAL_IMAGE_NAME as $REMOTE_IMAGE_NAME"
docker tag $LOCAL_IMAGE_NAME $REMOTE_IMAGE_NAME

echo "Pushing image $REMOTE_IMAGE_NAME"
docker push $REMOTE_IMAGE_NAME

echo "Deploying image $REMOTE_IMAGE_NAME to $REGION"
gcloud run deploy $SERVICE_NAME \
       --image=$REMOTE_IMAGE_NAME \
       --region $REGION \
       --allow-unauthenticated \
       --port $PORT \
       --update-secrets "$SECRETS" \
       --memory 2Gi \
       --cpu 4
