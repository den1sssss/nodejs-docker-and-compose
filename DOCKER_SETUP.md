# Инструкция по настройке Docker

## Структура проекта

- `backend/kupipodariday-backend/` - исходный код бэкенда (NestJS)
- `frontend/kupipodariday-frontend/` - исходный код фронтенда (React)
- `docker-compose.yml` - конфигурация для запуска всех сервисов
- `env.example` - пример файла с переменными окружения

## Переменные окружения

Скопируйте `env.example` в `.env` и заполните значения:

- `POSTGRES_USER` - имя пользователя PostgreSQL
- `POSTGRES_PASSWORD` - пароль пользователя БД
- `POSTGRES_DB` - имя базы данных
- `POSTGRES_PGDATA` - директория с данными БД (для volume)
- `JWT_SECRET` - секретный ключ для JWT
- `REACT_APP_API_URL` - URL бэкенда для фронтенда (например, https://api.yourdomain.com)

## Запуск

```bash
docker-compose up -d
```

## Проверка

- Фронтенд: http://localhost:8081
- Бэкенд: http://localhost:4000
- Health check бэкенда: http://localhost:4000/health

## Особенности Dockerfile

### Бэкенд
- Multi-stage build
- Первый этап: сборка проекта (npm ci, npm run build)
- Второй этап: только production зависимости, без src (только dist)
- Запуск через pm2-runtime

### Фронтенд
- Multi-stage build
- Первый этап: сборка React приложения (npm ci, npm run build)
- Второй этап: nginx для раздачи статики
- Конфигурация nginx с поддержкой React Router
