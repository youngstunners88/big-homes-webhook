#!/bin/bash
# Big Homes - Failover Monitor
# Runs on both accounts, detects failure and promotes other

ACCOUNT_A_IP="${ACCOUNT_A_IP:-10.0.0.1}"  # Replace with actual IPs
ACCOUNT_B_IP="${ACCOUNT_B_IP:-10.0.0.2}"
MY_IP="${MY_IP:-127.0.0.1}"
CHECK_INTERVAL=60  # 1 minute

echo "🛡️ Big Homes Failover Monitor"
echo "==============================="
echo "This IP: $MY_IP"
echo "Account A: $ACCOUNT_A_IP"
echo "Account B: $ACCOUNT_B_IP"
echo ""

while true; do
    TIMESTAMP=$(date)
    
    # Determine other account
    if [ "$MY_IP" = "$ACCOUNT_A_IP" ]; then
        OTHER_IP="$ACCOUNT_B_IP"
        OTHER_NAME="B"
        MY_NAME="A"
    else
        OTHER_IP="$ACCOUNT_A_IP"
        OTHER_NAME="A"
        MY_NAME="B"
    fi
    
    # Check if other account is reachable
    if curl -s --max-time 5 "http://$OTHER_IP:8080/health" &>/dev/null; then
        echo "[$TIMESTAMP] ✅ Account $OTHER_NAME is alive"
        STATUS="active"
    else
        echo "[$TIMESTAMP] ⚠️ Account $OTHER_NAME is DOWN!"
        
        # Check if I should take over
        if [ "$MY_NAME" = "B" ]; then
            echo "[$TIMESTAMP] 🚀 Taking over as PRIMARY!"
            # Promote self:
            # docker-compose up -d  # Ensure all services running
            # Update DNS/Spreadsheet status
        fi
    fi
    
    # Report my status
    echo "$TIMESTAMP:$MY_NAME:alive" | curl -s -X POST "https://gsheet.webhook/failover" -d @- 2>/dev/null || true
    
    sleep $CHECK_INTERVAL
done
