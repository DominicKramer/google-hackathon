#!/bin/bash

TAG=$(date +%s)
PROJECT_ID=$(gcloud config list --format 'value(core.project)' 2>/dev/null)
REGION=$(cat ../server/.env | grep GOOGLE_CLOUD_LOCATION | sed 's|GOOGLE_CLOUD_LOCATION=||g')
LOCAL_IMAGE_NAME=web:$TAG
REMOTE_IMAGE_NAME=us-central1-docker.pkg.dev/$PROJECT_ID/google-hackathon/web:$TAG
BUILD_ARGS=$(cat .env.local | sed 's@^@--build-arg @g' | paste -s -d " " -)
RUNTIME_ARGS=$(cat .env.local | sed 's@^@@g' | paste -s -d "," -)
SERVICE_NAME=web

echo "Building image $LOCAL_IMAGE_NAME"
docker build --platform linux/amd64 $BUILD_ARGS -t $LOCAL_IMAGE_NAME .

echo "Tagging image $LOCAL_IMAGE_NAME as $REMOTE_IMAGE_NAME"
docker tag $LOCAL_IMAGE_NAME $REMOTE_IMAGE_NAME

echo "Pushing image $REMOTE_IMAGE_NAME"
docker push $REMOTE_IMAGE_NAME

echo "Deploying image $REMOTE_IMAGE_NAME to $REGION"
gcloud run deploy $SERVICE_NAME \
       --image=$REMOTE_IMAGE_NAME \
       --region $REGION \
       --allow-unauthenticated \
       --port 8080 \
       --set-env-vars "$RUNTIME_ARGS"
