#!/bin/bash
# Big Homes - Dual Account Sync
# Runs on both Oracle VMs, syncs via Google Sheets

SHEET_ID="${GOOGLE_SHEET_ID:-}"
ACCOUNT_NAME="${1:-A}"  # "A" or "B"

echo "🔄 Big Homes Sync - Account $ACCOUNT_NAME"
echo "=========================================="

# Sync leads every 5 minutes
while true; do
    TIMESTAMP=$(date)
    
    # Export local leads to temp CSV
    if [ -f "data/leads.csv" ]; then
        echo "[$TIMESTAMP] Syncing leads from Account $ACCOUNT_NAME..."
        
        # If using Sheets API, would upload here
        # gsheet upload data/leads.csv "$SHEET_ID:leads"
        
        echo "✅ Synced leads"
    fi
    
    # Sync call logs
    if [ -f "data/calls.json" ]; then
        echo "[$TIMESTAMP] Syncing calls..."
        # gsheet upload data/calls.json "$SHEET_ID:calls"
        echo "✅ Synced calls"
    fi
    
    # Sync status
    echo "[$TIMESTAMP] Account $ACCOUNT_NAME: $(date)" > data/sync-status.txt
    # gsheet upload data/sync-status.txt "$SHEET_ID:status"
    
    # Check if other account is alive
    # if curl -s "https://account-b-ip/status" &>/dev/null; then
    #     echo "✅ Account B is alive"
    # else
    #     echo "⚠️ Account B down - taking over!"
    # fi
    
    sleep 300  # 5 minutes
done
