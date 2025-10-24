#!/bin/bash

echo "Setting up Android development environment..."

# Install Java
echo "Installing Java 17..."
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
echo "JAVA_HOME set to: $JAVA_HOME"

# Install Android command line tools
echo "Installing Android command line tools..."
brew install --cask android-commandlinetools

# Set Android environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "ANDROID_HOME set to: $ANDROID_HOME"

# Accept licenses and install required packages
echo "Installing Android SDK packages..."
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

echo "Setup complete! You can now build APK with:"
echo "cd android && ./gradlew assembleDebug"
