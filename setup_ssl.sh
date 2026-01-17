#!/bin/bash

# Автоматическая настройка SSL сертификатов
# Использование: ./setup_ssl.sh

set -e

FRONTEND_DOMAIN="sirazovdenis.nomorepartiessbs.ru"
BACKEND_DOMAIN="api.sirazovdenis.nomorepartiessbs.ru"

echo "🔒 Настройка SSL сертификатов для проекта КупиПодариДай"
echo "Frontend: $FRONTEND_DOMAIN"
echo "Backend: $BACKEND_DOMAIN"
echo ""

# Проверка прав root
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Этот скрипт требует прав root. Используйте sudo:"
    echo "   sudo ./setup_ssl.sh"
    exit 1
fi

# Проверка наличия Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Установка Nginx..."
    apt update
    apt install nginx -y
fi

# Проверка статуса Nginx
if ! systemctl is-active --quiet nginx; then
    echo "▶️  Запуск Nginx..."
    systemctl start nginx
    systemctl enable nginx
fi

# Создание директорий для конфигураций
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# Создание конфигурации для фронтенда
echo "📝 Создание конфигурации Nginx для фронтенда..."
cat > /etc/nginx/sites-available/$FRONTEND_DOMAIN << 'NGINX_FRONTEND'
server {
    listen 80;
    server_name sirazovdenis.nomorepartiessbs.ru;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты для долгих запросов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
NGINX_FRONTEND

# Создание конфигурации для бэкенда
echo "📝 Создание конфигурации Nginx для бэкенда..."
cat > /etc/nginx/sites-available/$BACKEND_DOMAIN << 'NGINX_BACKEND'
server {
    listen 80;
    server_name api.sirazovdenis.nomorepartiessbs.ru;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты для долгих запросов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Увеличение размера тела запроса
        client_max_body_size 10M;
    }
}
NGINX_BACKEND

# Активация конфигураций
echo "🔗 Активация конфигураций Nginx..."
ln -sf /etc/nginx/sites-available/$FRONTEND_DOMAIN /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/$BACKEND_DOMAIN /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации если она мешает
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
fi

# Проверка конфигурации Nginx
echo "🔍 Проверка конфигурации Nginx..."
if nginx -t; then
    echo "✅ Конфигурация Nginx валидна"
    systemctl reload nginx
else
    echo "❌ Ошибка в конфигурации Nginx"
    exit 1
fi

# Проверка работы контейнеров
echo "🔍 Проверка работы Docker контейнеров..."
if ! docker ps | grep -q kupipodariday-frontend; then
    echo "⚠️  Контейнер фронтенда не запущен. Запустите: docker-compose up -d"
fi

if ! docker ps | grep -q kupipodariday-backend; then
    echo "⚠️  Контейнер бэкенда не запущен. Запустите: docker-compose up -d"
fi

# Проверка доступности сервисов
echo "🔍 Проверка доступности сервисов..."
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081 || echo "000")
BACKEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 || echo "000")

if [ "$FRONTEND_CHECK" != "200" ]; then
    echo "⚠️  Фронтенд не отвечает на localhost:8081 (HTTP $FRONTEND_CHECK)"
    echo "   Убедитесь, что контейнеры запущены: docker-compose up -d"
fi

if [ "$BACKEND_CHECK" != "200" ] && [ "$BACKEND_CHECK" != "404" ]; then
    echo "⚠️  Бэкенд не отвечает на localhost:4000 (HTTP $BACKEND_CHECK)"
    echo "   Убедитесь, что контейнеры запущены: docker-compose up -d"
fi

# Установка Certbot
echo "📦 Проверка установки Certbot..."
if ! command -v certbot &> /dev/null; then
    echo "📦 Установка Certbot..."
    apt update
    apt install certbot python3-certbot-nginx -y
else
    echo "✅ Certbot уже установлен"
fi

# Проверка DNS записей
echo "🔍 Проверка DNS записей..."
FRONTEND_IP=$(dig +short $FRONTEND_DOMAIN | head -1)
BACKEND_IP=$(dig +short $BACKEND_DOMAIN | head -1)
SERVER_IP=$(curl -s ifconfig.me || echo "не определен")

echo "   Frontend DNS: $FRONTEND_DOMAIN -> $FRONTEND_IP"
echo "   Backend DNS:  $BACKEND_DOMAIN -> $BACKEND_IP"
echo "   Server IP:    $SERVER_IP"

if [ -z "$FRONTEND_IP" ] || [ -z "$BACKEND_IP" ]; then
    echo "⚠️  DNS записи не настроены или еще не распространились"
    echo "   Убедитесь, что настроены A-записи:"
    echo "   $FRONTEND_DOMAIN -> $SERVER_IP"
    echo "   $BACKEND_DOMAIN -> $SERVER_IP"
    echo ""
    echo "   Подождите несколько минут после настройки DNS"
    read -p "Продолжить получение сертификатов? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Получение SSL сертификатов
echo "🔒 Получение SSL сертификатов..."
echo "   Это может занять несколько минут..."

certbot --nginx \
    -d $FRONTEND_DOMAIN \
    -d $BACKEND_DOMAIN \
    --non-interactive \
    --agree-tos \
    --email admin@$FRONTEND_DOMAIN \
    --redirect || {
    
    echo "⚠️  Автоматическое получение сертификатов не удалось"
    echo "   Попробуйте вручную:"
    echo "   certbot --nginx -d $FRONTEND_DOMAIN -d $BACKEND_DOMAIN"
    exit 1
}

# Проверка сертификатов
echo "🔍 Проверка установленных сертификатов..."
certbot certificates

# Настройка автоматического обновления
echo "🔄 Настройка автоматического обновления сертификатов..."
systemctl enable certbot.timer
systemctl start certbot.timer

# Финальная проверка
echo ""
echo "🔍 Финальная проверка..."
echo "   Frontend: https://$FRONTEND_DOMAIN"
FRONTEND_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://$FRONTEND_DOMAIN || echo "000")
echo "   Backend:  https://$BACKEND_DOMAIN"
BACKEND_HTTPS=$(curl -s -o /dev/null -w "%{http_code}" https://$BACKEND_DOMAIN || echo "000")

echo ""
if [ "$FRONTEND_HTTPS" = "200" ] || [ "$FRONTEND_HTTPS" = "301" ] || [ "$FRONTEND_HTTPS" = "302" ]; then
    echo "✅ Frontend доступен по HTTPS (HTTP $FRONTEND_HTTPS)"
else
    echo "⚠️  Frontend может быть еще не готов (HTTP $FRONTEND_HTTPS)"
fi

if [ "$BACKEND_HTTPS" = "200" ] || [ "$BACKEND_HTTPS" = "404" ] || [ "$BACKEND_HTTPS" = "301" ] || [ "$BACKEND_HTTPS" = "302" ]; then
    echo "✅ Backend доступен по HTTPS (HTTP $BACKEND_HTTPS)"
else
    echo "⚠️  Backend может быть еще не готов (HTTP $BACKEND_HTTPS)"
fi

echo ""
echo "✅ Настройка SSL сертификатов завершена!"
echo ""
echo "🌐 Ваши сервисы доступны по адресам:"
echo "   Frontend: https://$FRONTEND_DOMAIN"
echo "   Backend:  https://$BACKEND_DOMAIN"
echo ""
echo "📋 Полезные команды:"
echo "   sudo certbot certificates              # Список сертификатов"
echo "   sudo certbot renew --dry-run          # Тест обновления"
echo "   sudo nginx -t                          # Проверка конфигурации"
echo "   sudo systemctl status nginx           # Статус Nginx"
echo "   sudo systemctl reload nginx            # Перезагрузка Nginx"
