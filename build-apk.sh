#!/bin/bash

# Build APK using Docker
echo "Building APK using Docker..."

# Create output directory
mkdir -p ./output

# Build Docker image
docker build -t openmenu-rider-build .

# Run container and copy APK
docker run --rm -v $(pwd)/output:/output openmenu-rider-build

echo "APK built successfully!"
echo "APK location: ./output/app-debug.apk"
