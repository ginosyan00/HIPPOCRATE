# Скрипт для исправления Prisma Client после добавления bufferTime
# Запустите этот скрипт в PowerShell

Write-Host "🔵 Остановка всех процессов Node.js..." -ForegroundColor Blue
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "🔵 Обновление Prisma Client..." -ForegroundColor Blue
cd backend
npx prisma generate

Write-Host "🔵 Проверка синхронизации базы данных..." -ForegroundColor Blue
npx prisma db push

Write-Host "✅ Готово! Теперь можно перезапустить сервер." -ForegroundColor Green
Write-Host "Запустите: npm start" -ForegroundColor Yellow


