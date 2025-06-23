# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="user:dominickramer@gmail.com" \
    --role="roles/run.admin"

# Grant Service Account User role (to deploy services)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="user:dominickramer@gmail.com" \
    --role="roles/iam.serviceAccountUser"

# Grant Storage Object Viewer role (to access container images)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="user:dominickramer@gmail.com" \
    --role="roles/storage.objectViewer"

# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API (if using Container Registry)
gcloud services enable containerregistry.googleapis.com

# Enable Artifact Registry API (if using Artifact Registry)
gcloud services enable artifactregistry.googleapis.com

gcloud run deploy web --source .

gcloud auth configure-docker us-central1-docker.pkg.dev

# how to get the current project id
gcloud config list --format 'value(core.project)' 2>/dev/null
