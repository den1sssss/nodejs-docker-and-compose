# Команды для пересборки на сервере

## Выполните эти команды на сервере 158.160.208.208:

```bash
# 1. Подключитесь к серверу
ssh root@158.160.208.208

# 2. Перейдите в директорию проекта
cd ~/nodejs-docker-and-compose

# 3. Обновите репозиторий
git pull

# 4. Проверьте/обновите .env файл
cat .env | grep REACT_APP_API_URL
# Должно быть: REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# Если неправильно, исправьте:
nano .env
# Установите: REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# 5. Остановите контейнеры
docker-compose down

# 6. Удалите старые образы
docker rmi nodejs-docker-and-compose-frontend nodejs-docker-and-compose-backend 2>/dev/null || true

# 7. Пересоберите БЕЗ кэша
docker-compose build --no-cache

# 8. Запустите контейнеры
docker-compose up -d

# 9. Подождите 15 секунд
sleep 15

# 10. Проверьте статус
docker-compose ps

# 11. Проверьте логи
docker-compose logs --tail=50

# 12. Проверьте работу
curl http://localhost:4000
curl http://localhost:8081

# 13. Перезапустите Nginx (если нужно)
sudo systemctl reload nginx
```

## Или используйте автоматический скрипт:

```bash
cd ~/nodejs-docker-and-compose
git pull
chmod +x rebuild.sh
./rebuild.sh
```

## Проверка после пересборки:

1. **Локально на сервере:**
   - http://localhost:4000 - должен вернуть JSON с информацией об API
   - http://localhost:8081 - должен вернуть HTML страницу фронтенда

2. **Через домены:**
   - https://sirazovdenis.nomorepartiessbs.ru - фронтенд
   - https://api.sirazovdenis.nomorepartiessbs.ru - бэкенд

3. **Проверка логов:**
   ```bash
   docker-compose logs -f
   ```

## Если проблема сохраняется:

1. Проверьте Nginx конфигурацию:
   ```bash
   sudo nginx -t
   sudo cat /etc/nginx/sites-available/api.sirazovdenis.nomorepartiessbs.ru
   ```

2. Проверьте, что порты открыты:
   ```bash
   sudo netstat -tlnp | grep -E '4000|8081'
   ```

3. Перезапустите все:
   ```bash
   docker-compose restart
   sudo systemctl restart nginx
   ```
