#!/bin/bash
# Big Homes - Full Swarm Deployment Script
# Run this on Oracle VM after cloning

set -e

echo "🚀 Big Homes Swarm Deployment"
echo "================================"

# Configuration
export OPENCLAW_API_KEY="${OPENCLAW_API_KEY:-}"
export RETELL_API_KEY="key_006f8e2707bfeb9ef4c1a61d8d00"

if [ -z "$OPENCLAW_API_KEY" ]; then
    echo "❌ Set OPENCLAW_API_KEY first!"
    exit 1
fi

# Clone repo
echo "📦 Cloning Big Homes..."
git clone https://github.com/youngstunners88/big-homes-webhook.git
cd big-homes-webhook

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com | bash
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo apt install -y docker-compose
fi

# Create data directories
mkdir -p data/leads data/calls data/logs

# Start the swarm
echo "🎯 Starting Big Homes Swarm..."
docker-compose up -d

# Wait for containers to start
sleep 10

# Show status
echo ""
echo "📊 SWARM STATUS"
echo "==============="
docker-compose ps

echo ""
echo "📋 To watch logs:"
echo "  docker-compose logs -f commander"
echo "  docker-compose logs -f hunter"
echo "  docker-compose logs -f voice"
echo ""
echo "✅ Swarm deployed! Commander will report every 30 minutes."
