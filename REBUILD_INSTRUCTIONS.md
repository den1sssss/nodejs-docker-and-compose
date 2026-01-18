# Инструкция по пересборке проекта на сервере

## Проблема
По ссылке https://api.sirazovdenis.nomorepartiessbs.ru открывается не тот проект.

## Решение: пересборка проекта

### Быстрый способ (автоматический скрипт)

На сервере выполните:

```bash
# 1. Подключитесь к серверу
ssh root@158.160.208.208

# 2. Перейдите в директорию проекта
cd ~/nodejs-docker-and-compose

# 3. Обновите репозиторий
git pull

# 4. Убедитесь, что .env файл правильный
cat .env | grep REACT_APP_API_URL
# Должно быть: REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# Если неправильно, исправьте:
nano .env
# Установите: REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# 5. Запустите скрипт пересборки
chmod +x rebuild.sh
./rebuild.sh
```

### Ручной способ

Если скрипт не работает, выполните команды вручную:

```bash
# 1. Остановите контейнеры
docker-compose down

# 2. Удалите старые образы
docker rmi nodejs-docker-and-compose-frontend nodejs-docker-and-compose-backend 2>/dev/null || true

# 3. Проверьте .env файл
cat .env | grep REACT_APP_API_URL
# Должно быть: REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# 4. Пересоберите образы БЕЗ кэша
docker-compose build --no-cache

# 5. Запустите контейнеры
docker-compose up -d

# 6. Проверьте статус
docker-compose ps
docker-compose logs --tail=50
```

## Важно: проверка .env файла

Убедитесь, что в `.env` файле установлен правильный URL:

```env
REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru
```

Это значение используется при сборке фронтенда и определяет, на какой адрес будут отправляться запросы.

## Проверка после пересборки

1. **Проверьте локально на сервере:**
   ```bash
   curl http://localhost:4000
   curl http://localhost:8081
   ```

2. **Проверьте через домены:**
   - Frontend: https://sirazovdenis.nomorepartiessbs.ru
   - Backend: https://api.sirazovdenis.nomorepartiessbs.ru

3. **Проверьте логи:**
   ```bash
   docker-compose logs -f
   ```

## Если проблема сохраняется

1. **Проверьте Nginx конфигурацию:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

2. **Проверьте, что контейнеры запущены:**
   ```bash
   docker-compose ps
   ```

3. **Проверьте DNS записи:**
   ```bash
   dig +short api.sirazovdenis.nomorepartiessbs.ru
   # Должно вернуть: 158.160.208.208
   ```

4. **Перезапустите Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

5. **Проверьте firewall:**
   ```bash
   sudo ufw status
   # Порты 80 и 443 должны быть открыты
   ```

## Дополнительная информация

После пересборки фронтенд будет использовать правильный URL бэкенда:
- В коде: `https://api.sirazovdenis.nomorepartiessbs.ru`
- Это значение берется из `REACT_APP_API_URL` при сборке

Если вы изменили `.env` файл, обязательно пересоберите фронтенд:
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```
