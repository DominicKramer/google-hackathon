#!/bin/bash

gcloud secrets list --format="value(name)" \
  | while read -r secret; do
      echo "$secret=$(gcloud secrets versions access latest --secret="$secret")"
    done
