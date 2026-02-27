@echo off
REM ARC Raiders LFG - Windows Setup Script
REM This script sets up the entire project correctly

echo.
echo ================================
echo ARC Raiders LFG Setup Script
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found!
    echo Please run this script from I:\ARC-RAIDERS_LFG
    echo.
    pause
    exit /b 1
)

echo [1/7] Creating directories...
if not exist "prisma" mkdir prisma
if not exist "src\app\api\auth\[...nextauth]" mkdir src\app\api\auth\[...nextauth]
if not exist "src\app\admin" mkdir src\app\admin
if not exist "src\app\api\admin" mkdir src\app\api\admin
if not exist "src\lib" mkdir src\lib
if not exist "src\components" mkdir src\components
if not exist "src\types" mkdir src\types
echo ✓ Directories created

echo.
echo [2/7] Cleaning npm cache...
call npm cache clean --force
echo ✓ Cache cleaned

echo.
echo [3/7] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [4/7] Creating Prisma schema...
REM The schema will be copied to prisma/schema.prisma
REM For now, we'll use the discord version
if exist "prisma-schema-discord.prisma" (
    copy /Y "prisma-schema-discord.prisma" "prisma\schema.prisma"
    echo ✓ Schema copied from Discord version
) else if exist "prisma-schema-owner.prisma" (
    copy /Y "prisma-schema-owner.prisma" "prisma\schema.prisma"
    echo ✓ Schema copied from Owner version
) else (
    echo WARNING: No schema file found in current directory
    echo Please copy either:
    echo   - prisma-schema-discord.prisma to prisma/schema.prisma, OR
    echo   - prisma-schema-owner.prisma to prisma/schema.prisma
    echo.
    pause
    exit /b 1
)

echo.
echo [5/7] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ERROR: Prisma generate failed!
    pause
    exit /b 1
)
echo ✓ Prisma client generated

echo.
echo [6/7] Creating database...
call npx prisma db push --skip-generate
if errorlevel 1 (
    echo ERROR: Prisma db push failed!
    echo Try running this command manually:
    echo   npx prisma db push
    echo.
    pause
    exit /b 1
)
echo ✓ Database created

echo.
echo [7/7] Verifying installation...
if not exist "node_modules" (
    echo ERROR: node_modules not found!
    echo Please run: npm install
    pause
    exit /b 1
)
echo ✓ Installation verified

echo.
echo ================================
echo Setup Complete! ✓
echo ================================
echo.
echo Next steps:
echo 1. Copy these files to their locations:
echo    - All provided .tsx files to src/app/ and src/components/
echo    - All provided .ts files to src/lib/ and src/app/api/
echo 2. Create .env.local with your Discord credentials
echo 3. Run: npm run dev
echo 4. Visit: http://localhost:3000
echo.
pause
