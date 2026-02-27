# 🪟 WINDOWS POWERSHELL QUICK COMMANDS

Copy and paste these commands in PowerShell (Admin mode) in `I:\ARC-RAIDERS_LFG`

---

## 🚀 COMPLETE SETUP (Run These in Order)

```powershell
# 1. Navigate to project (if not already there)
cd I:\ARC-RAIDERS_LFG

# 2. Create required folders
mkdir prisma, src, src\app, src\lib, src\components, src\types, src\app\api, src\app\admin, public

# 3. Copy Prisma schema (choose one)
Copy-Item "prisma-schema-discord.prisma" "prisma\schema.prisma" -Force

# 4. Clean and reinstall
npm cache clean --force
rm -r node_modules -Force -ErrorAction SilentlyContinue
rm package-lock.json -ErrorAction SilentlyContinue
npm install

# 5. Generate Prisma
npx prisma generate

# 6. Create database
npx prisma db push

# 7. Start development
npm run dev
```

---

## 📁 CREATE DIRECTORY STRUCTURE

```powershell
# All at once
mkdir prisma
mkdir src
mkdir src\app
mkdir src\app\api
mkdir src\app\api\auth
mkdir "src\app\api\auth\[...nextauth]"
mkdir src\app\admin
mkdir src\app\api\admin
mkdir src\lib
mkdir src\components
mkdir src\types
mkdir public
```

---

## 📋 COPY PRISMA SCHEMA

```powershell
# Option 1: Discord version (simpler)
Copy-Item "prisma-schema-discord.prisma" "prisma\schema.prisma" -Force

# Option 2: Owner version (full features)
Copy-Item "prisma-schema-owner.prisma" "prisma\schema.prisma" -Force

# Verify
ls prisma\
```

---

## 🧹 CLEAN & REINSTALL

```powershell
# Clear npm
npm cache clean --force

# Delete modules
rm -r node_modules -Force -ErrorAction SilentlyContinue

# Delete lock file
rm package-lock.json -ErrorAction SilentlyContinue

# Fresh install (this takes 2-5 minutes)
npm install
```

---

## 🗄️ PRISMA COMMANDS

```powershell
# Generate Prisma client
npx prisma generate

# Sync database with schema
npx prisma db push

# Create database (for new schema changes)
npx prisma migrate dev --name add_new_feature

# View database graphically
npx prisma studio
```

---

## ▶️ RUN DEVELOPMENT SERVER

```powershell
# Start (runs on port 3000)
npm run dev

# Start on different port
npm run dev -- -p 3001

# Build for production
npm run build

# Run production build
npm start
```

---

## 🛑 STOP & RESTART

```powershell
# Stop current server
Ctrl+C

# Check if port is in use
netstat -ano | findstr :3000

# Kill process on port
taskkill /PID [PID_NUMBER] /F

# Example: taskkill /PID 12345 /F
```

---

## ✅ VERIFY INSTALLATION

```powershell
# Check node/npm versions
node --version
npm --version

# Check if Prisma schema exists
Test-Path prisma\schema.prisma

# Check if node_modules exists
Test-Path node_modules

# Check if package.json exists
Test-Path package.json

# List all files
ls

# Count installed packages
(ls node_modules).Count
```

---

## 📦 INSTALL ADDITIONAL PACKAGES (if needed)

```powershell
# Install single package
npm install package-name

# Install dev package
npm install --save-dev package-name

# Install all from package.json
npm install
```

---

## 🔧 TROUBLESHOOTING COMMANDS

```powershell
# Clear npm cache completely
npm cache clean --force

# Check npm configuration
npm config list

# Check Node.js installation
where node

# Check npm installation
where npm

# Get npm version
npm -v

# Get Node version
node -v
```

---

## 📝 CREATE/VIEW FILES

```powershell
# Create empty file
New-Item filename.txt

# Create with content
"content here" | Out-File filename.txt

# View file content
cat filename.txt
# or
type filename.txt

# Edit file (opens in editor)
notepad filename.txt

# Delete file
rm filename.txt

# Delete folder
rm -r foldername -Force
```

---

## 🌐 TEST SERVER

```powershell
# Check if server is running
# Should return status code
curl http://localhost:3000 -StatusCode

# Or open browser
# https://localhost:3000
```

---

## 💡 ENVIRONMENT VARIABLES

```powershell
# Create .env.local file
@"
DISCORD_CLIENT_ID=your_id_here
DISCORD_CLIENT_SECRET=your_secret_here
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
"@ | Out-File .env.local

# View .env.local
cat .env.local

# Edit .env.local
notepad .env.local
```

---

## 🎯 TYPICAL WORKFLOW

```powershell
# 1. Start day
npm run dev

# 2. Make code changes in editor

# 3. Next.js auto-reloads

# 4. Test in http://localhost:3000

# 5. End of day - stop server
Ctrl+C

# 6. Commit changes
git add .
git commit -m "description"
```

---

## ⚡ ONE-LINER COMPLETE SETUP

```powershell
mkdir prisma,src,src\app,src\lib,src\components,src\types,src\app\api,src\app\admin,public; Copy-Item "prisma-schema-discord.prisma" "prisma\schema.prisma" -Force; npm cache clean --force; rm -r node_modules -Force -ErrorAction SilentlyContinue; rm package-lock.json -ErrorAction SilentlyContinue; npm install; npx prisma generate; npx prisma db push; npm run dev
```

---

## 📊 MONITORING

```powershell
# Watch for file changes
# (useful for when auto-reload doesn't work)

# Force refresh in browser
# Ctrl+Shift+R (hard refresh)

# Check browser console
# F12 → Console tab

# Check terminal for errors
# Should show in PowerShell when running npm run dev
```

---

## 🆘 IF NOTHING WORKS

```powershell
# Nuclear option - start completely fresh
rm -r node_modules -Force
rm -r .next -Force
rm package-lock.json
rm prisma\dev.db
npm cache clean --force
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## 📚 HELPFUL RESOURCES

```
Node.js Docs: https://nodejs.org/docs
npm Docs: https://docs.npmjs.com
Next.js Docs: https://nextjs.org/docs
Prisma Docs: https://prisma.io/docs
```

---

**Save this file for quick reference!** 💾

Just copy/paste the commands you need. 🚀
