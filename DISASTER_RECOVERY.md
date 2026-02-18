# Big Homes - Disaster Recovery Plan

## Daily Backup
```bash
./backup.sh
```

## If Oracle Kills VM

### Option 1: New Oracle Account (Free)
- Different email = new free tier
- Takes 15 minutes to set up

### Option 2: Hetzner ($3.79/month)
- 2 CPU, 4GB RAM, 40GB SSD
- https://hetzner.com

### Option 3: Racknerd ($10/year)
- 1 CPU, 1GB RAM, 15GB SSD
- https://racknerd.com

## Restore Process
```bash
# On new VM
git clone https://github.com/youngstunners88/big-homes-webhook.git

# Restore backup
tar -xzf backup-YYYYMMDD.tar.gz -C ~

# Redeploy
cd big-homes-webhook
export OPENCLAW_API_KEY="your-key"
docker-compose up -d
```

## Emergency Contacts
- Oracle Support: https://console.oraclecloud.com/support
- Your notes: [Add emergency contact info]
