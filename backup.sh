#!/bin/bash
# Big Homes - Backup & Disaster Recovery

BACKUP_DIR="/tmp/backups"
DATE=$(date +%Y%m%d)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📦 Big Homes Backup - $DATE"
echo "=============================="

# Backup OpenClaw config
echo "💾 Backing up OpenClaw..."
tar -czf $BACKUP_DIR/openclaw-$DATE.tar.gz ~/.openclaw/

# Backup data
echo "💾 Backing up data..."
tar -czf $BACKUP_DIR/data-$DATE.tar.gz ~/big-homes/data/

# List backups
echo ""
echo "📋 Backups created:"
ls -lh $BACKUP_DIR/

# Upload to Google Drive (if rclone configured)
if command -v rclone &> /dev/null; then
    echo ""
    echo "☁️ Uploading to Google Drive..."
    rclone copy $BACKUP_DIR gdrive:backups/ --progress
    echo "✅ Uploaded to GDrive:backups/"
fi

echo ""
echo "✅ Backup complete: $BACKUP_DIR"
echo ""
echo "📌 To restore:"
echo "  tar -xzf backup-YYYYMMDD.tar.gz -C ~"
