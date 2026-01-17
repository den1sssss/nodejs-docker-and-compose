# Быстрый деплой на сервер

## Команды для выполнения на сервере (158.160.208.208)

Выполните эти команды на сервере через SSH:

```bash
# 1. Перейдите в директорию проекта (или склонируйте репозиторий)
cd ~/nodejs-docker-and-compose
# или если нужно клонировать:
# git clone <your-repo-url> ~/nodejs-docker-and-compose
# cd ~/nodejs-docker-and-compose

# 2. Создайте .env файл (если еще не создан)
cat > .env << 'EOF'
POSTGRES_USER=kupipodariday_user
POSTGRES_PASSWORD=secure_password_change_me
POSTGRES_DB=kupipodariday_db
POSTGRES_HOST=database
POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata
JWT_SECRET=your_very_secure_jwt_secret_key_change_this
REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
EOF

# 3. Остановите существующие контейнеры (если есть)
docker-compose down

# 4. Соберите и запустите
docker-compose build --no-cache
docker-compose up -d

# 5. Проверьте статус
docker-compose ps

# 6. Просмотрите логи
docker-compose logs --tail=50
```

## Или используйте скрипт деплоя:

```bash
chmod +x deploy.sh
./deploy.sh
```

## После запуска контейнеров настройте Nginx:

См. подробные инструкции в файле `DEPLOY_INSTRUCTIONS.md`
