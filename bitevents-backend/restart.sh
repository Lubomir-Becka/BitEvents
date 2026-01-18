#!/bin/bash
# Quick restart script for development

echo "🛑 Stopping containers..."
docker compose down

echo "🗑️  Removing old database data (pg_data/)..."
sudo rm -rf pg_data/

echo "🔨 Building and starting containers..."
docker compose up --build

