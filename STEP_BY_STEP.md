# Пошаговая инструкция по деплою проекта

## Шаг 1: Подготовка локального репозитория

1. Убедитесь, что все изменения закоммичены и запушены в репозиторий:
```bash
cd /Users/denis/Desktop/nodejs-docker-and-compose
git add .
git commit -m "Докеризация проекта КупиПодариДай"
git push
```

2. Убедитесь, что репозиторий публичный (для доступа с сервера)

---

## Шаг 2: Подключение к серверу

1. Откройте терминал и подключитесь к серверу:
```bash
ssh root@158.160.208.208
```
Или используйте вашего пользователя, если не root.

2. Если подключение требует пароль или ключ, введите его.

---

## Шаг 3: Установка Docker и Docker Compose (если не установлены)

Выполните на сервере:

```bash
# Проверьте, установлены ли Docker и Docker Compose
docker --version
docker-compose --version
```

Если не установлены:

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Проверка установки
docker --version
docker-compose --version
```

---

## Шаг 4: Клонирование репозитория на сервер

На сервере выполните:

```bash
# Перейдите в домашнюю директорию
cd ~

# Склонируйте репозиторий (замените <your-repo-url> на URL вашего репозитория)
git clone <your-repo-url> nodejs-docker-and-compose

# Перейдите в директорию проекта
cd nodejs-docker-and-compose
```

**Если репозиторий приватный**, используйте:
```bash
git clone https://github.com/your-username/your-repo.git nodejs-docker-and-compose
# Введите логин и пароль (или токен)
```

---

## Шаг 5: Создание файла .env

На сервере выполните:

```bash
# Создайте .env файл из примера
cp env.example .env

# Откройте файл для редактирования
nano .env
```

Вставьте следующие значения (замените на свои безопасные):

```env
POSTGRES_USER=kupipodariday_user
POSTGRES_PASSWORD=your_very_secure_password_here
POSTGRES_DB=kupipodariday_db
POSTGRES_HOST=database
POSTGRES_PGDATA=/var/lib/postgresql/data/pgdata

JWT_SECRET=your_very_secure_jwt_secret_key_min_32_chars

REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
```

**Важно:**
- Используйте надежные пароли
- JWT_SECRET должен быть длинным и случайным
- REACT_APP_API_URL должен указывать на ваш домен бэкенда

Сохраните файл: `Ctrl+O`, затем `Enter`, затем `Ctrl+X`

---

## Шаг 6: Запуск Docker контейнеров

На сервере выполните:

```bash
# Убедитесь, что вы в директории проекта
cd ~/nodejs-docker-and-compose

# Остановите существующие контейнеры (если есть)
docker-compose down

# Соберите образы (это займет несколько минут)
docker-compose build --no-cache

# Запустите контейнеры
docker-compose up -d
```

---

## Шаг 7: Проверка работы контейнеров

На сервере выполните:

```bash
# Проверьте статус контейнеров
docker-compose ps

# Должны быть запущены 3 контейнера:
# - kupipodariday-database
# - kupipodariday-backend  
# - kupipodariday-frontend

# Просмотрите логи
docker-compose logs --tail=50

# Проверьте логи каждого сервиса отдельно
docker-compose logs backend
docker-compose logs frontend
docker-compose logs database
```

Если видите ошибки, проверьте логи подробнее:
```bash
docker-compose logs -f
```

---

## Шаг 8: Проверка работы сервисов локально на сервере

На сервере выполните:

```bash
# Проверьте бэкенд
curl http://localhost:4000/health

# Должен вернуть: {"status":"ok",...} или похожий ответ

# Проверьте фронтенд
curl http://localhost:8081

# Должен вернуть HTML код страницы
```

---

## Шаг 9: Установка и настройка Nginx

На сервере выполните:

```bash
# Установите Nginx (если не установлен)
sudo apt update
sudo apt install nginx -y

# Проверьте статус
sudo systemctl status nginx
```

---

## Шаг 10: Настройка Nginx для фронтенда

На сервере выполните:

```bash
# Создайте конфигурацию для фронтенда
sudo nano /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru
```

Вставьте следующее содержимое:

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

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Шаг 11: Настройка Nginx для бэкенда

На сервере выполните:

```bash
# Создайте конфигурацию для бэкенда
sudo nano /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru
```

Вставьте следующее содержимое:

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

Сохраните: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Шаг 12: Активация конфигураций Nginx

На сервере выполните:

```bash
# Создайте символические ссылки
sudo ln -s /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/

# Проверьте конфигурацию на ошибки
sudo nginx -t

# Если все ОК, перезапустите Nginx
sudo systemctl restart nginx
```

---

## Шаг 13: Настройка DNS записей

Убедитесь, что DNS записи настроены правильно:

1. Зайдите в панель управления доменами
2. Убедитесь, что есть A-запись для `sirazovdenis.nomorepartiessbs.ru` → `158.160.208.208`
3. Убедитесь, что есть A-запись для `api.sirazovdenis.nomorepartiessbs.ru` → `158.160.208.208`

Проверьте DNS:
```bash
# На вашем локальном компьютере
nslookup sirazovdenis.nomorepartiessbs.ru
nslookup api.sirazovdenis.nomorepartiessbs.ru
```

---

## Шаг 14: Получение SSL сертификатов

На сервере выполните:

```bash
# Установите Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получите сертификаты для обоих доменов
sudo certbot --nginx -d sirazovdenis.nomorepartiessbs.ru -d api.sirazovdenis.nomorepartiessbs.ru

# Следуйте инструкциям:
# - Введите email
# - Согласитесь с условиями
# - Certbot автоматически настроит Nginx
```

Certbot автоматически:
- Получит сертификаты
- Обновит конфигурации Nginx для HTTPS
- Настроит автоматическое обновление сертификатов

---

## Шаг 15: Финальная проверка

1. **Проверьте фронтенд:**
   - Откройте в браузере: https://sirazovdenis.nomorepartiessbs.ru
   - Должна открыться страница приложения

2. **Проверьте бэкенд:**
   - Откройте в браузере: https://api.sirazovdenis.nomorepartiessbs.ru/health
   - Должен вернуться JSON с статусом

3. **Проверьте взаимодействие:**
   - Откройте фронтенд
   - Попробуйте зарегистрироваться или войти
   - Проверьте, что запросы идут на правильный домен бэкенда

---

## Шаг 16: Проверка SSL сертификатов

Проверьте сертификаты на сайте:
https://www.sslshopper.com/ssl-checker.html

Введите оба домена и убедитесь, что сертификаты активны.

---

## Полезные команды для управления

```bash
# Просмотр статуса контейнеров
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Перезапуск сервисов
docker-compose restart

# Остановка сервисов
docker-compose down

# Остановка и удаление volumes (ОСТОРОЖНО: удалит данные БД)
docker-compose down -v

# Обновление кода (после git pull)
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Если что-то пошло не так

1. **Контейнеры не запускаются:**
   ```bash
   docker-compose logs -f
   # Проверьте логи и исправьте ошибки
   ```

2. **Nginx не работает:**
   ```bash
   sudo nginx -t  # Проверка конфигурации
   sudo systemctl status nginx  # Статус сервиса
   sudo journalctl -u nginx -f  # Логи Nginx
   ```

3. **Проблемы с DNS:**
   - Подождите несколько минут после настройки DNS
   - Проверьте через: `nslookup your-domain.com`

4. **Проблемы с SSL:**
   ```bash
   sudo certbot certificates  # Список сертификатов
   sudo certbot renew --dry-run  # Тест обновления
   ```

---

## Готово! 🎉

Ваш проект должен быть доступен по адресам:
- Frontend: https://sirazovdenis.nomorepartiessbs.ru
- Backend: https://api.sirazovdenis.nomorepartiessbs.ru
