# Virtual Server & Deployment Guide for ARC Raiders LFG

## 🌐 Overview

This guide explains how to:
1. Run the LFG server on a virtual machine
2. Use a virtual IP separate from your home IP
3. Expose it to the internet with your connection
4. Configure for production use

---

## 🔧 Option 1: Hyper-V Virtual Machine (Windows)

### Step 1: Create Virtual Machine

1. Open **Hyper-V Manager**
2. **New** → **Virtual Machine**
3. Configure:
   - **Name:** ARC-LFG-Server
   - **RAM:** 4GB minimum
   - **Virtual Switch:** External (bridges to your network)
   - **Hard Drive:** 50GB

4. Install **Ubuntu Server 22.04 LTS** or **Windows Server 2022**

### Step 2: Assign Virtual IP

```bash
# On the VM, edit netplan config
sudo nano /etc/netplan/00-installer-config.yaml

# Add static IP
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4

# Apply changes
sudo netplan apply

# Verify IP
ip addr show
```

### Step 3: Install Node.js & Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL (or use cloud database)
sudo apt install -y postgresql postgresql-contrib

# Verify installations
node --version
npm --version
```

### Step 4: Clone and Deploy Project

```bash
# Navigate to /opt
cd /opt

# Clone your project (or copy files)
git clone https://github.com/yourusername/arc-raiders-lfg.git
cd arc-raiders-lfg

# Install dependencies
npm install

# Create .env.local
nano .env.local

# Build project
npm run build

# Start server
npm start
```

### Step 5: Set Up Reverse Proxy with Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/arc-lfg

# Add this configuration:
```

```nginx
upstream nextjs {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://nextjs;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/arc-lfg /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Set Up SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### Step 7: Port Forwarding

1. Log into your **router** (usually 192.168.1.1)
2. Go to **Port Forwarding** settings
3. Forward:
   - **External Port:** 80 → Internal: 80 (VM IP)
   - **External Port:** 443 → Internal: 443 (VM IP)
4. Enable **UPnP** (optional, for dynamic forwarding)

---

## 🌩️ Option 2: Docker Container (Recommended for Easy Setup)

### Step 1: Install Docker

```bash
# Windows: Download Docker Desktop
# https://www.docker.com/products/docker-desktop

# Linux:
sudo apt install -y docker.io
sudo usermod -aG docker $USER
```

### Step 2: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install --production

# Copy application
COPY . .

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

### Step 3: Create docker-compose.yml

```yaml
version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: arc-lfg-db
    environment:
      POSTGRES_USER: arc_user
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: arc_raiders_lfg
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - arc-network

  # Next.js Application
  app:
    build: .
    container_name: arc-lfg-app
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://arc_user:secure_password_here@postgres:5432/arc_raiders_lfg
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${CLERK_PUB_KEY}
      CLERK_SECRET_KEY: ${CLERK_SECRET}
      NODE_ENV: production
    ports:
      - "3000:3000"
    networks:
      - arc-network
    restart: always

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: arc-lfg-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - arc-network
    restart: always

volumes:
  postgres_data:

networks:
  arc-network:
    driver: bridge
```

### Step 4: Build and Run

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

---

## 🚀 Option 3: Using Ngrok (Easiest for Testing)

### Step 1: Install Ngrok

```bash
# Download from https://ngrok.com/download
# Or using package managers:

# Windows (Chocolatey)
choco install ngrok

# macOS (Homebrew)
brew install ngrok/ngrok/ngrok

# Linux
curl -fsSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz | tar xz
```

### Step 2: Authenticate

```bash
# Sign up at https://ngrok.com
# Get your auth token

ngrok config add-authtoken YOUR_AUTH_TOKEN
```

### Step 3: Create Tunnel

```bash
# Simple tunnel to localhost:3000
ngrok http 3000

# Or save as config
# ~/.ngrok2/ngrok.yml:
authtoken: your_auth_token
tunnels:
  arc-lfg:
    proto: http
    addr: 3000
    domain: your-custom-domain.ngrok.io  # Custom domain (paid feature)
```

### Step 4: Start Your App

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start Ngrok
ngrok start arc-lfg

# You'll get:
# https://abc123.ngrok.io → http://localhost:3000
```

---

## 📊 Option 4: Production Hosting (Recommended)

Instead of self-hosting, consider these platforms:

### Vercel (Made by Next.js creators)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

**Pros:**
- Automatic scaling
- Global CDN
- Free tier available
- Zero-config deployment

### Railway

1. Go to https://railway.app
2. Connect your GitHub repo
3. Set environment variables
4. Deploy with one click

### Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create arc-lfg

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

---

## 🔐 Security Checklist for Virtual Server

- [ ] **Enable Firewall**
  ```bash
  sudo ufw enable
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  ```

- [ ] **Fail2Ban (DDoS Protection)**
  ```bash
  sudo apt install fail2ban
  sudo systemctl enable fail2ban
  ```

- [ ] **Regular Updates**
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

- [ ] **SSH Security**
  ```bash
  # Edit /etc/ssh/sshd_config
  PermitRootLogin no
  PasswordAuthentication no
  ```

- [ ] **Database Backups**
  ```bash
  # Daily backup
  0 2 * * * pg_dump -U arc_user arc_raiders_lfg > /backups/lfg_$(date +\%Y\%m\%d).sql
  ```

- [ ] **SSL Certificates**
  - Use Let's Encrypt (free)
  - Auto-renewal every 90 days

- [ ] **Environment Variables**
  - Never commit .env.local
  - Use .env.local.template
  - Rotate API keys regularly

---

## 📈 Performance Optimization

### Enable Caching

```nginx
# In nginx config
location /_next/static {
    expires 365d;
    add_header Cache-Control "public, immutable";
}

location / {
    proxy_cache_valid 200 1h;
    proxy_cache_valid 404 10m;
}
```

### Database Connection Pooling

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  // Check: https://www.prisma.io/docs/orm/overview/databases/postgresql#connection-pool
}
```

### Image Optimization

```typescript
// next.config.js
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
},
```

---

## 🔍 Monitoring & Maintenance

### Health Check Script

```bash
#!/bin/bash
# monitor.sh

# Check if app is running
curl -f http://localhost:3000 || (
  echo "App down!" 
  systemctl restart arc-lfg
)

# Check disk space
disk=$(df / | awk '{if (NR==2) print $5}' | cut -d '%' -f 1)
if [ $disk -gt 85 ]; then
  echo "Disk usage: $disk%"
fi

# Check memory
memory=$(free | awk 'NR==2{print int($3/$2 * 100)}')
if [ $memory -gt 80 ]; then
  echo "Memory usage: $memory%"
fi
```

```bash
# Add to crontab
0 * * * * /opt/arc-lfg/monitor.sh
```

---

## 🎯 Summary: Quick Recommendation

**For Development:**
- Use **Ngrok** (5 minutes setup)

**For Small Deployment:**
- Use **Vercel** (free tier, auto-scaling)

**For Full Control:**
- Use **Docker** on Hyper-V VM with custom domain

**For Production:**
- Combine Docker + Railway/Heroku + Cloudflare CDN

---

## 🆘 Common Issues

| Problem | Solution |
|---------|----------|
| Connection refused | Check firewall, port forwarding |
| Slow performance | Enable caching, optimize DB queries |
| Certificate errors | Renew SSL, check domain DNS |
| Database errors | Check connection string, verify PostgreSQL |
| Memory leak | Monitor logs, restart services |

---

Good luck with your deployment! 🚀
