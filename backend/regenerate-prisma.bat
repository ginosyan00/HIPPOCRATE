@echo off
echo Regenerating Prisma Client...
cd /d "%~dp0"
npx prisma generate
echo.
echo Prisma Client regenerated successfully!
echo Please restart your server.
pause
