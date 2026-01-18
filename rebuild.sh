#!/bin/bash

# Скрипт для пересборки проекта на сервере
# Использование: ./rebuild.sh

set -e

echo "🔨 Пересборка проекта КупиПодариДай"
echo ""

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "❌ Файл .env не найден!"
    echo "Создайте .env файл из env.example:"
    echo "  cp env.example .env"
    echo "  nano .env"
    echo ""
    echo "Убедитесь, что установлен правильный REACT_APP_API_URL:"
    echo "  REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru"
    exit 1
fi

# Проверка REACT_APP_API_URL в .env
if ! grep -q "REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru" .env; then
    echo "⚠️  ВНИМАНИЕ: REACT_APP_API_URL в .env не установлен правильно!"
    echo "Текущее значение:"
    grep "REACT_APP_API_URL" .env || echo "  Не найдено"
    echo ""
    echo "Исправьте в .env файле:"
    echo "  REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru"
    echo ""
    read -p "Продолжить пересборку? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Текущая конфигурация .env:"
grep -E "REACT_APP_API_URL|POSTGRES_|JWT_SECRET" .env | sed 's/=.*/=***/' || true
echo ""

# Остановка контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down

# Удаление старых образов фронтенда и бэкенда
echo "🗑️  Удаление старых образов..."
docker rmi nodejs-docker-and-compose-frontend nodejs-docker-and-compose-backend 2>/dev/null || true

# Очистка build кэша (опционально, но рекомендуется)
echo "🧹 Очистка build кэша..."
docker builder prune -f

# Пересборка образов
echo "🔨 Пересборка Docker образов (это займет несколько минут)..."
echo ""

echo "1️⃣  Сборка бэкенда..."
docker-compose build --no-cache backend

echo ""
echo "2️⃣  Сборка фронтенда (с правильным REACT_APP_API_URL)..."
docker-compose build --no-cache frontend

echo ""
echo "3️⃣  Запуск контейнеров..."
docker-compose up -d

# Ожидание запуска
echo ""
echo "⏳ Ожидание запуска сервисов (15 секунд)..."
sleep 15

# Проверка статуса
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

# Проверка работы
echo ""
echo "🔍 Проверка работы сервисов..."
echo ""

BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 || echo "000")
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 || echo "000")

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "404" ]; then
    echo "✅ Бэкенд работает (HTTP $BACKEND_STATUS)"
else
    echo "⚠️  Бэкенд может быть еще не готов (HTTP $BACKEND_STATUS)"
fi

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Фронтенд работает (HTTP $FRONTEND_STATUS)"
else
    echo "⚠️  Фронтенд может быть еще не готов (HTTP $FRONTEND_STATUS)"
fi

# Проверка логов
echo ""
echo "📋 Последние логи (первые 30 строк):"
docker-compose logs --tail=30

echo ""
echo "✅ Пересборка завершена!"
echo ""
echo "🌐 Проверьте доступность:"
echo "   Frontend: https://sirazovdenis.nomorepartiessbs.ru"
echo "   Backend:  https://api.sirazovdenis.nomorepartiessbs.ru"
echo ""
echo "📝 Полезные команды:"
echo "   docker-compose logs -f          # Просмотр логов"
echo "   docker-compose ps                # Статус контейнеров"
echo "   docker-compose restart           # Перезапуск"
