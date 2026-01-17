# Инструкции по деплою на сервер

## Подготовка сервера

1. Подключитесь к серверу по SSH:
```bash
ssh root@158.160.208.208
# или
ssh your_user@158.160.208.208
```

2. Убедитесь, что установлены Docker и Docker Compose:
```bash
sudo docker --version
sudo docker-compose --version
```

Если не установлены, установите:
```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Деплой проекта

1. Склонируйте репозиторий (если еще не склонирован):
```bash
cd ~
git clone <your-repository-url> nodejs-docker-and-compose
cd nodejs-docker-and-compose
```

2. Создайте файл `.env` из примера:
```bash
cp env.example .env
```

3. Отредактируйте `.env` файл с реальными значениями:
```bash
nano .env
```

Установите следующие значения:
```env
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=your_database_name
POSTGRES_HOST=database
POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata

JWT_SECRET=your_very_secure_jwt_secret_key

# ВАЖНО: Установите правильный URL бэкенда для фронтенда
REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
```

4. Запустите деплой:
```bash
# Вариант 1: Использовать скрипт деплоя
./deploy.sh

# Вариант 2: Вручную
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

5. Проверьте статус контейнеров:
```bash
docker-compose ps
```

6. Просмотрите логи:
```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f database
```

## Настройка Nginx на сервере

После запуска контейнеров нужно настроить Nginx для проксирования запросов:

1. Установите Nginx (если не установлен):
```bash
sudo apt update
sudo apt install nginx -y
```

2. Создайте конфигурацию для фронтенда:
```bash
sudo nano /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru
```

Содержимое:
```nginx
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
```

3. Создайте конфигурацию для бэкенда:
```bash
sudo nano /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru
```

Содержимое:
```nginx
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
```

4. Активируйте конфигурации:
```bash
sudo ln -s /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/
```

5. Проверьте конфигурацию и перезапустите Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Настройка SSL сертификатов

1. Установите Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. Получите сертификаты:
```bash
sudo certbot --nginx -d sirazovdenis.nomorepartiessbs.ru -d api.sirazovdenis.nomorepartiessbs.ru
```

3. Certbot автоматически обновит конфигурации Nginx и настроит автоматическое обновление сертификатов.

## Проверка работы

1. Проверьте доступность сервисов:
```bash
curl http://localhost:4000/health  # Бэкенд
curl http://localhost:8081        # Фронтенд
```

2. Проверьте через браузер:
- Frontend: https://sirazovdenis.nomorepartiessbs.ru
- Backend: https://api.sirazovdenis.nomorepartiessbs.ru/health

## Полезные команды

```bash
# Остановка сервисов
docker-compose down

# Перезапуск сервисов
docker-compose restart

# Просмотр логов
docker-compose logs -f

# Вход в контейнер
docker-compose exec backend sh
docker-compose exec frontend sh

# Очистка (удаление контейнеров и volumes)
docker-compose down -v
```
