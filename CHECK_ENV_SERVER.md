# Проверка .env файла на сервере

## Быстрая проверка

На сервере выполните:

```bash
# 1. Подключитесь к серверу
ssh root@158.160.208.208

# 2. Перейдите в директорию проекта
cd ~/nodejs-docker-and-compose

# 3. Обновите репозиторий (если нужно)
git pull

# 4. Запустите скрипт проверки
chmod +x check_env.sh
./check_env.sh
```

## Ручная проверка

Если скрипт недоступен, выполните вручную:

```bash
# 1. Проверьте наличие .env файла
ls -la .env

# 2. Просмотрите содержимое (без паролей)
cat .env | grep -E "POSTGRES_USER|POSTGRES_DB|POSTGRES_HOST|REACT_APP_API_URL"

# 3. Проверьте REACT_APP_API_URL
grep "REACT_APP_API_URL" .env

# Должно быть:
# REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
```

## Если REACT_APP_API_URL неправильный

Исправьте вручную:

```bash
# Откройте файл для редактирования
nano .env

# Найдите строку REACT_APP_API_URL и измените на:
REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# Сохраните: Ctrl+O, Enter, Ctrl+X
```

Или автоматически:

```bash
sed -i 's|^REACT_APP_API_URL=.*|REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru|' .env

# Проверьте
grep "REACT_APP_API_URL" .env
```

## Полная проверка всех переменных

```bash
# Покажите все переменные (пароли будут видны!)
cat .env

# Или только имена переменных
cat .env | cut -d'=' -f1

# Проверьте обязательные переменные
echo "Проверка обязательных переменных:"
for var in POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB POSTGRES_HOST POSTGRES_PGDATA JWT_SECRET REACT_APP_API_URL; do
    if grep -q "^${var}=" .env; then
        echo "✅ $var: установлен"
    else
        echo "❌ $var: не найден"
    fi
done
```

## Создание .env файла (если отсутствует)

```bash
# Скопируйте из примера
cp env.example .env

# Отредактируйте
nano .env

# Установите правильные значения:
# POSTGRES_USER=ваш_пользователь
# POSTGRES_PASSWORD=ваш_пароль
# POSTGRES_DB=ваша_база
# POSTGRES_HOST=database
# POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata
# JWT_SECRET=ваш_секретный_ключ
# REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
```

## После исправления

После исправления .env файла обязательно пересоберите проект:

```bash
./rebuild.sh
```

Или вручную:

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```
