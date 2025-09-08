#!/bin/bash
# Kill all Expo/Metro related processes
pkill -f expo
pkill -f metro
pkill -f "jest-worker"
lsof -ti:8081 | xargs kill -9 2>/dev/null
echo "Cleaned up all Expo/Metro processes"