#!/bin/bash
# Big Homes - Oracle Cloud Setup Script

set -e

echo "🚀 Setting up Big Homes on Oracle Cloud..."

# Update
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "🔧 Installing dependencies..."
sudo apt install -y curl git python3 python3-pip

# Install OpenClaw
echo "🤖 Installing OpenClaw..."
curl -fsSL https://openclaw.ai/install.sh | bash

# Configure model
echo "⚙️ Configuring MiniMax M2.5..."
openclaw config set agent.model openrouter/minimax/minimax-m2.5

# Clone Big Homes
echo "📂 Cloning Big Homes repo..."
git clone https://github.com/youngstunners88/big-homes-webhook.git
cd big-homes-webhook/worker

# Install camoufox
echo "🕵️ Installing camoufox..."
pip install camoufox[geoip] --break-system-packages

# Install playwright browsers
echo "🌐 Installing browsers..."
python3 -m playwright install chromium

echo "✅ Setup complete!"
echo "Run: python3 script.py"
