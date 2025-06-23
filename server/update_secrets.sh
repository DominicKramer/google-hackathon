#!/bin/bash

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo "Error: .env file not found in current directory"
  exit 1
fi

# Read each line from .env file
while IFS= read -r line; do
  # Skip empty lines and comments
  if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi
  
  # Check if line contains key=value pattern
  if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
    # Extract key and value using regex capture groups
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    
    # Remove leading/trailing whitespace from key
    key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    # Remove leading/trailing whitespace from value
    value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    echo "Updating secret: $key"
    echo -n "$value" | \
        gcloud secrets create "$key" \
        --replication-policy="automatic" \
        --data-file=-
  fi
done < ".env"
