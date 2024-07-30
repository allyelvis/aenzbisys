#!/bin/bash

# Set variables
PROJECT_ID="aenzbi_idle"
ZONE="us-central1-b"
CLUSTER_NAME="aenzbi-cluster"
DISK_NAME="aenzbi-disk"
DISK_SIZE="100GB"
SNAPSHOT_NAME="aenzbi-snapshot"
BUCKET_NAME="aenzbi-bucket"
SQL_INSTANCE_NAME="aenzbi-sql-instance"
SQL_DATABASE_NAME="aenzbi-db"
SQL_USER_NAME="aenzbi-user"
SQL_PASSWORD="yourpassword"
ADMIN_USER="admin@aenzbi.bi"
ROOT_DIR="/path/to/your/project"
APPS=("sales" "accounting" "pos" "app-creator")
DOCKER_IMAGES=("gcr.io/$PROJECT_ID/sales-image" "gcr.io/$PROJECT_ID/accounting-image" "gcr.io/$PROJECT_ID/pos-image" "gcr.io/$PROJECT_ID/app-creator-image")
DEPLOYMENT_NAMES=("sales-deployment" "accounting-deployment" "pos-deployment" "app-creator-deployment")
SERVICE_NAMES=("sales-service" "accounting-service" "pos-service" "app-creator-service")
INGRESS_NAMES=("sales-ingress" "accounting-ingress" "pos-ingress" "app-creator-ingress")

# Check and install necessary tools
check_install() {
  local cmd="$1"
  if ! command -v $cmd &> /dev/null; then
    echo "$cmd not found. Installing..."
    sudo apt-get update && sudo apt-get install -y $cmd
  fi
}

check_install "gcloud"
check_install "docker"
check_install "kubectl"
check_install "npm"

# Create Google Cloud project
echo "Creating Google Cloud project..."
gcloud projects create $PROJECT_ID --set-as-default

# Link billing account
echo "Linking billing account..."
gcloud beta billing projects link $PROJECT_ID --billing-account=BILLING_ACCOUNT_ID

# Enable necessary services
echo "Enabling services..."
gcloud services enable container.googleapis.com sqladmin.googleapis.com appengine.googleapis.com

# Create directories and files
echo "Setting up project directories and files..."
mkdir -p $ROOT_DIR/{contents,pages,folders,images,resources,files,functions,codes,scripts,interface,environment,operations,calculations}

# Create sample content for the applications
for app in "${APPS[@]}"; do
  mkdir -p $ROOT_DIR/$app
  cat <<EOF > $ROOT_DIR/$app/index.js
// Sample Node.js application for $app
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello from $app!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(\`$app is running on port \${PORT}\`);
});
EOF

  cat <<EOF > $ROOT_DIR/$app/package.json
{
  "name": "$app",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.17.1"
  }
}
EOF

  cd $ROOT_DIR/$app && npm install
done

# Create Dockerfile for each app
for app in "${APPS[@]}"; do
  cat <<EOF > $ROOT_DIR/$app/Dockerfile
# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Command to run the app
CMD ["npm", "start"]
EOF
done

# Create App Engine service
echo "Creating App Engine service..."
gcloud app create --project=$PROJECT_ID

# Create Compute Engine VM
echo "Creating Compute Engine VM..."
gcloud compute instances create aenzbi-vm --project=$PROJECT_ID --zone=$ZONE --machine-type=e2-medium

# Create a persistent disk
echo "Creating persistent disk..."
gcloud compute disks create $DISK_NAME --project=$PROJECT_ID --zone=$ZONE --size=$DISK_SIZE

# Attach the disk to the VM
echo "Attaching disk to VM..."
gcloud compute instances attach-disk aenzbi-vm --disk $DISK_NAME --zone=$ZONE

# Take a snapshot of the persistent disk
echo "Creating snapshot of disk..."
gcloud compute snapshots create $SNAPSHOT_NAME --source-disk=$DISK_NAME --zone=$ZONE

# Create Kubernetes Engine cluster
echo "Creating Kubernetes Engine cluster..."
gcloud container clusters create $CLUSTER_NAME --project=$PROJECT_ID --zone=$ZONE --num-nodes=3

# Get credentials for the cluster
echo "Getting credentials for Kubernetes cluster..."
gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE --project=$PROJECT_ID

# Create a storage bucket
echo "Creating storage bucket..."
gsutil mb -p $PROJECT_ID -l us-central1 gs://$BUCKET_NAME/

# Create Cloud SQL instance
echo "Creating Cloud SQL instance..."
gcloud sql instances create $SQL_INSTANCE_NAME --project=$PROJECT_ID --tier=db-f1-micro --region=us-central1

# Create a SQL database
echo "Creating SQL database..."
gcloud sql databases create $SQL_DATABASE_NAME --instance=$SQL_INSTANCE_NAME

# Create a SQL user and set the password
echo "Creating SQL user and setting password..."
gcloud sql users create $SQL_USER_NAME --instance=$SQL_INSTANCE_NAME --password=$SQL_PASSWORD

# Grant all permissions to admin@aenzbi.bi
echo "Granting permissions to $ADMIN_USER..."
gcloud sql users set-password $SQL_USER_NAME --instance=$SQL_INSTANCE_NAME --password=$SQL_PASSWORD
gcloud sql instances patch $SQL_INSTANCE_NAME --project=$PROJECT_ID --authorized-networks=0.0.0.0/0

# Build and push Docker images
echo "Building and pushing Docker images..."
for i in ${!APPS[@]}; do
  APP=${APPS[$i]}
  DOCKER_IMAGE=${DOCKER_IMAGES[$i]}

  # Build Docker image
  docker build -t $DOCKER_IMAGE $ROOT_DIR/$APP

  # Push Docker image to Google Container Registry
  docker push $DOCKER_IMAGE

  # Create Kubernetes deployment
  cat <<EOF > $ROOT_DIR/${APP}-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${DEPLOYMENT_NAMES[$i]}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: $APP
  template:
    metadata:
      labels:
        app: $APP
    spec:
      containers:
      - name: ${APP}-container
        image: $DOCKER_IMAGE
        env:
        - name: DB_HOST
          value: "127.0.0.1" # Update to the appropriate host or connection name
        - name: DB_USER
          value: "$SQL_USER_NAME"
        - name: DB_PASSWORD
          value: "$SQL_PASSWORD"
        - name: DB_NAME
          value: "$SQL_DATABASE_NAME"
        ports:
        - containerPort: 8080
EOF

  # Apply Kubernetes deployment
  kubectl apply -f $ROOT_DIR/${APP}-deployment.yaml

  # Create Kubernetes service
  cat <<EOF > $ROOT_DIR/${APP}-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: ${SERVICE_NAMES[$i]}
spec:
  selector:
    app: $APP
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
  type: LoadBalancer
EOF

  # Apply Kubernetes service
  kubectl apply -f $ROOT_DIR/${APP}-service.yaml

  # Create Kubernetes ingress
  cat <<EOF > $ROOT_DIR/${APP}-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${INGRESS_NAMES[$i]}
spec:
  rules:
  - http:
      paths:
      - path: /$APP
        pathType: Prefix
        backend:
          service:
            name: ${SERVICE_NAMES[$i]}
            port:
              number: 80
EOF

  # Apply Kubernetes ingress
  kubectl apply -f $ROOT_DIR/${APP}-ingress.yaml
done

echo "All Google Cloud resources and applications have been deployed successfully."

# Additional Configurations
echo "Configuring Cloud SQL and IAM roles for admin@aenzbi.bi..."
gcloud sql users set-password $SQL_USER_NAME --instance=$SQL_INSTANCE_NAME --password=$SQL_PASSWORD
gcloud sql instances patch $SQL_INSTANCE_NAME --project=$PROJECT_ID --authorized-networks=0.0.0.0/0

# Create service account for deploying applications
echo "Creating service account for deploying applications..."
gcloud iam service-accounts create aenzbi-deployer \
    --display-name="Aenzbi Deployer"

# Grant roles to the service account
echo "Granting IAM roles to service account..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:aenzbi-deployer@$PROJECT_ID.iam.gserviceaccount.com"\
    role="roles/owner"