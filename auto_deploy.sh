#!/bin/bash

# Автоматический скрипт деплоя на сервер
# Использование: ./auto_deploy.sh [ssh_user@]server_ip

set -e

SERVER="${1:-root@158.160.208.208}"
PROJECT_DIR="~/nodejs-docker-and-compose"
REPO_URL=$(git remote get-url origin 2>/dev/null || echo "")

echo "🚀 Автоматический деплой проекта КупиПодариДай"
echo "Сервер: $SERVER"
echo ""

# Проверка наличия репозитория
if [ -z "$REPO_URL" ]; then
    echo "⚠️  Не удалось определить URL репозитория"
    echo "Убедитесь, что вы находитесь в git репозитории"
    exit 1
fi

echo "📦 URL репозитория: $REPO_URL"
echo ""

# Создание скрипта для выполнения на сервере
cat > /tmp/deploy_remote.sh << 'REMOTE_SCRIPT'
#!/bin/bash
set -e

PROJECT_DIR="$1"
REPO_URL="$2"

echo "🔧 Настройка на сервере..."

# Переход в домашнюю директорию
cd ~

# Клонирование или обновление репозитория
if [ -d "$PROJECT_DIR" ]; then
    echo "📂 Обновление существующего репозитория..."
    cd "$PROJECT_DIR"
    git pull || true
else
    echo "📥 Клонирование репозитория..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
fi

# Проверка Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Установка Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Создание .env файла если не существует
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    cp env.example .env
    
    # Генерация безопасных значений
    POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
    
    # Обновление .env с безопасными значениями
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
    sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru|" .env
    
    echo "✅ .env файл создан с безопасными значениями"
else
    echo "✅ .env файл уже существует"
    # Обновляем только REACT_APP_API_URL если нужно
    if ! grep -q "REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru" .env; then
        sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru|" .env
        echo "✅ Обновлен REACT_APP_API_URL"
    fi
fi

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down || true

# Удаление старых контейнеров
docker rm -f kupipodariday-database kupipodariday-backend kupipodariday-frontend 2>/dev/null || true

# Сборка образов
echo "🔨 Сборка Docker образов..."
docker-compose build --no-cache

# Запуск контейнеров
echo "▶️  Запуск контейнеров..."
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска сервисов..."
sleep 15

# Проверка статуса
echo "📊 Статус контейнеров:"
docker-compose ps

# Проверка работы
echo ""
echo "🔍 Проверка работы сервисов..."
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

echo ""
echo "📋 Последние логи:"
docker-compose logs --tail=20

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "Следующие шаги:"
echo "1. Настройте Nginx (см. STEP_BY_STEP.md, шаги 9-12)"
echo "2. Получите SSL сертификаты (см. STEP_BY_STEP.md, шаг 14)"
echo ""
echo "Полезные команды:"
echo "  docker-compose logs -f          # Просмотр логов"
echo "  docker-compose ps                # Статус контейнеров"
echo "  docker-compose restart           # Перезапуск"
REMOTE_SCRIPT

chmod +x /tmp/deploy_remote.sh

echo "📤 Копирование скрипта на сервер..."
scp /tmp/deploy_remote.sh "$SERVER:/tmp/deploy_remote.sh" || {
    echo "❌ Не удалось скопировать скрипт на сервер"
    echo "Убедитесь, что у вас настроен SSH доступ к серверу"
    echo ""
    echo "Вы можете выполнить деплой вручную:"
    echo "1. Скопируйте содержимое проекта на сервер"
    echo "2. Выполните команды из STEP_BY_STEP.md"
    exit 1
}

echo "🚀 Запуск деплоя на сервере..."
ssh "$SERVER" "bash /tmp/deploy_remote.sh $PROJECT_DIR '$REPO_URL'"

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "Не забудьте:"
echo "1. Настроить Nginx для проксирования запросов"
echo "2. Получить SSL сертификаты через certbot"
echo "3. Настроить DNS записи (если еще не настроены)"
