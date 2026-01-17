# Настройка SSL сертификатов

## Автоматическая настройка (рекомендуется)

На сервере выполните:

```bash
# 1. Подключитесь к серверу
ssh root@158.160.208.208

# 2. Перейдите в директорию проекта
cd ~/nodejs-docker-and-compose

# 3. Запустите скрипт настройки SSL
sudo ./setup_ssl.sh
```

Скрипт автоматически:
- Установит Nginx (если не установлен)
- Создаст конфигурации для фронтенда и бэкенда
- Установит Certbot
- Получит SSL сертификаты
- Настроит автоматическое обновление

## Ручная настройка

Если автоматический скрипт не работает, выполните шаги вручную:

### Шаг 1: Установка Nginx

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Шаг 2: Создание конфигурации для фронтенда

```bash
sudo nano /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru
```

Вставьте:

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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Шаг 3: Создание конфигурации для бэкенда

```bash
sudo nano /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru
```

Вставьте:

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
        
        client_max_body_size 10M;
    }
}
```

### Шаг 4: Активация конфигураций

```bash
sudo ln -s /etc/nginx/sites-available/sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Удалите дефолтную конфигурацию
sudo nginx -t  # Проверка конфигурации
sudo systemctl reload nginx
```

### Шаг 5: Установка Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Шаг 6: Получение SSL сертификатов

```bash
sudo certbot --nginx \
    -d sirazovdenis.nomorepartiessbs.ru \
    -d api.sirazovdenis.nomorepartiessbs.ru
```

Следуйте инструкциям:
- Введите email
- Согласитесь с условиями
- Certbot автоматически обновит конфигурации Nginx

### Шаг 7: Проверка

```bash
# Проверка сертификатов
sudo certbot certificates

# Проверка доступности
curl -I https://sirazovdenis.nomorepartiessbs.ru
curl -I https://api.sirazovdenis.nomorepartiessbs.ru
```

## Важные замечания

1. **DNS записи должны быть настроены** перед получением сертификатов:
   - `sirazovdenis.nomorepartiessbs.ru` → `158.160.208.208`
   - `api.sirazovdenis.nomorepartiessbs.ru` → `158.160.208.208`

2. **Docker контейнеры должны быть запущены**:
   ```bash
   cd ~/nodejs-docker-and-compose
   docker-compose up -d
   ```

3. **Порты 80 и 443 должны быть открыты** в firewall

4. **Проверка DNS**:
   ```bash
   dig +short sirazovdenis.nomorepartiessbs.ru
   dig +short api.sirazovdenis.nomorepartiessbs.ru
   ```

## Автоматическое обновление сертификатов

Certbot автоматически настроит обновление сертификатов. Проверьте:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## Устранение проблем

### Ошибка: "Failed to obtain certificate"

- Проверьте DNS записи
- Убедитесь, что порты 80 и 443 открыты
- Проверьте, что домены указывают на правильный IP

### Ошибка: "Connection refused" на localhost:8081 или localhost:4000

- Убедитесь, что Docker контейнеры запущены:
  ```bash
  docker-compose ps
  docker-compose up -d
  ```

### Nginx не запускается

- Проверьте конфигурацию:
  ```bash
  sudo nginx -t
  ```
- Проверьте логи:
  ```bash
  sudo journalctl -u nginx -f
  ```

## Проверка SSL сертификатов

Проверьте сертификаты на сайте:
https://www.sslshopper.com/ssl-checker.html

Введите оба домена и убедитесь, что сертификаты активны.
