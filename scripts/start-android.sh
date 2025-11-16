#!/bin/bash

# Start emulator if not running
emulator -avd Medium_Phone_API_36 &

# Wait for device
adb wait-for-device

# Setup tunnel
adb reverse tcp:8081 tcp:8081

# Start expo
npx expo start