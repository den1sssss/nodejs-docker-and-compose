#!/bin/bash
set -e
ERRORS=0
WARNINGS=0
echo "🔍 Проверка соответствия проекта требованиям"
echo "=================================================="
echo ""

error() {
    echo "❌ $1"
    ((ERRORS++))
}
success() {
    echo "✅ $1"
}

echo "1. Проверка README.md..."
if [ -f README.md ]; then
    if grep -q "IP адрес" README.md && grep -q "Frontend https://" README.md && grep -q "Backend https://" README.md; then
        success "README.md содержит IP адрес и URL"
    else
        error "README.md не содержит IP адрес и/или URL"
    fi
else
    error "README.md не найден"
fi

echo ""
echo "2. Проверка Dockerfile бэкенда..."
if [ -f "backend/kupipodariday-backend/Dockerfile" ]; then
    grep -q "FROM node:16-alpine" "backend/kupipodariday-backend/Dockerfile" && success "Базовый образ node:16-alpine" || error "Неправильный базовый образ"
    grep -q "WORKDIR /app" "backend/kupipodariday-backend/Dockerfile" && success "WORKDIR /app" || error "WORKDIR не /app"
    grep -q "AS builder" "backend/kupipodariday-backend/Dockerfile" && grep -q "AS production" "backend/kupipodariday-backend/Dockerfile" && success "Multi-stage build" || error "Нет multi-stage build"
    grep -q "pm2-runtime" "backend/kupipodariday-backend/Dockerfile" && success "pm2-runtime используется" || error "pm2-runtime не используется"
    [ -f "backend/kupipodariday-backend/.dockerignore" ] && success ".dockerignore существует" || error ".dockerignore не найден"
else
    error "Dockerfile бэкенда не найден"
fi

echo ""
echo "3. Проверка Dockerfile фронтенда..."
if [ -f "frontend/kupipodariday-frontend/Dockerfile" ]; then
    grep -q "FROM node:16-alpine" "frontend/kupipodariday-frontend/Dockerfile" && grep -q "FROM nginx:latest" "frontend/kupipodariday-frontend/Dockerfile" && success "Правильные базовые образы" || error "Неправильные базовые образы"
    grep -q "AS builder" "frontend/kupipodariday-frontend/Dockerfile" && success "Multi-stage build" || error "Нет multi-stage build"
    [ -f "frontend/kupipodariday-frontend/nginx/conf.d/default.conf" ] && success "Nginx конфиг существует" || error "Nginx конфиг не найден"
    [ -f "frontend/kupipodariday-frontend/.dockerignore" ] && success ".dockerignore существует" || error ".dockerignore не найден"
else
    error "Dockerfile фронтенда не найден"
fi

echo ""
echo "4. Проверка docker-compose.yml..."
if [ -f "docker-compose.yml" ]; then
    grep -q "backend:" docker-compose.yml && grep -q "frontend:" docker-compose.yml && grep -q "database:" docker-compose.yml && success "Все три сервиса описаны" || error "Не все сервисы описаны"
    grep -q "container_name:" docker-compose.yml && success "Имена контейнеров указаны" || error "Имена контейнеров не указаны"
    grep -q "env_file:" docker-compose.yml && success "env_file используется" || error "env_file не используется"
    grep -q "4000:3000" docker-compose.yml && grep -q "8081:80" docker-compose.yml && success "Порты настроены правильно" || error "Порты настроены неправильно"
else
    error "docker-compose.yml не найден"
fi

echo ""
echo "5. Проверка env файлов..."
[ -f "env.example" ] && success "env.example существует" || error "env.example не найден"
grep -q "^\.env$" .gitignore 2>/dev/null && success ".env в .gitignore" || error ".env не в .gitignore"

echo ""
echo "=================================================="
if [ $ERRORS -eq 0 ]; then
    echo "✅ Все проверки пройдены!"
    exit 0
else
    echo "❌ Найдено ошибок: $ERRORS"
    exit 1
fi
