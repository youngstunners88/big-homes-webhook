#!/bin/bash
# Big Homes Swarm Launcher

# Configuration
NUM_WORKERS=${1:-4}
DURATION=${2:-8h}
API_KEY=${OPENCLAW_API_KEY:-""}

if [ -z "$API_KEY" ]; then
    echo "❌ Set OPENCLAW_API_KEY first"
    exit 1
fi

echo "🚀 Spawning $NUM_WORKERS OpenClaw workers for $DURATION..."

for i in $(seq 1 $NUM_WORKERS); do
    WORKER_NAME="openclaw-worker-$i"
    
    # Determine task based on worker number
    case $i in
        1) TASK="scrape_google_maps";;
        2) TASK="make_retell_calls";;
        3) TASK="validate_leads";;
        4) TASK="send_followup_emails";;
    esac
    
    echo "📦 Starting worker-$i: $TASK"
    
    docker run -d \
        --name "$WORKER_NAME" \
        -e OPENCLAW_API_KEY="$API_KEY" \
        -e WORKER_TASK="$TASK" \
        -e WORKER_ID="$i" \
        -v ~/.openclaw:/root/.openclaw \
        openclaw/openclaw:latest \
        openclaw run --autonomous --duration "$DURATION" --task "$TASK"
    
    echo "✅ Worker $i started: $TASK"
done

echo ""
echo "📊 Swarm Status:"
docker ps --filter "name=openclaw-worker"

echo ""
echo "📋 To watch logs:"
echo "  docker logs -f openclaw-worker-1"
echo ""
echo "📋 To stop all:"
echo "  docker stop \$(docker ps -q --filter 'name=openclaw-worker')"
