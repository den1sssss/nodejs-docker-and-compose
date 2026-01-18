#!/bin/bash
# Команды для выполнения на сервере
# Скопируйте и выполните эти команды на сервере 158.160.208.208

SERVER_IP="158.160.208.208"
REPO_URL="<YOUR_REPO_URL>"  # Замените на URL вашего репозитория

cat << 'EOF'
# ============================================
# КОМАНДЫ ДЛЯ ВЫПОЛНЕНИЯ НА СЕРВЕРЕ
# ============================================

# 1. Подключитесь к серверу
ssh root@158.160.208.208

# 2. Перейдите в домашнюю директорию
cd ~

# 3. Склонируйте репозиторий (замените <YOUR_REPO_URL>)
git clone <YOUR_REPO_URL> nodejs-docker-and-compose
cd nodejs-docker-and-compose

# 4. Проверьте Docker
docker --version || (curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh)
docker-compose --version || (sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose)

# 5. Создайте .env файл
cat > .env << 'ENVEOF'
POSTGRES_USER=kupipodariday_user
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
POSTGRES_DB=kupipodariday_db
POSTGRES_HOST=database
POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
ENVEOF

# Или используйте готовый пример и отредактируйте
cp env.example .env
nano .env  # Отредактируйте значения

# 6. Запустите проект
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 7. Проверьте статус
docker-compose ps
docker-compose logs --tail=50

# 8. Проверьте работу
curl http://localhost:4000
curl http://localhost:8081

# ============================================
# НАСТРОЙКА NGINX (после запуска контейнеров)
# ============================================

# Установите Nginx
sudo apt update
sudo apt install nginx -y

# Создайте конфигурацию для фронтенда
sudo tee /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name sirazovdenis.nomorepartiessbs.ru;

    location / {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# Создайте конфигурацию для бэкенда
sudo tee /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru > /dev/null << 'NGINXEOF'
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
    }
}
NGINXEOF

# Активируйте конфигурации
sudo ln -s /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/

# Проверьте и перезапустите Nginx
sudo nginx -t
sudo systemctl restart nginx

# ============================================
# SSL СЕРТИФИКАТЫ
# ============================================

# Установите Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получите сертификаты
sudo certbot --nginx -d sirazovdenis.nomorepartiessbs.ru -d api.sirazovdenis.nomorepartiessbs.ru

EOF

echo ""
echo "✅ Команды готовы!"
echo "Скопируйте содержимое этого файла и выполните на сервере"
