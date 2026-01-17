# Финальная инструкция по деплою

## ✅ Что уже выполнено локально:

1. ✓ Docker контейнеры собраны и запущены
2. ✓ Проект работает на localhost
3. ✓ Все файлы подготовлены
4. ✓ Изменения закоммичены в git

## 🚀 Быстрый деплой на сервер

### Вариант 1: Автоматический скрипт (рекомендуется)

```bash
# На вашем компьютере
cd /Users/denis/Desktop/nodejs-docker-and-compose
git push  # Если еще не запушено

# На сервере (158.160.208.208)
ssh root@158.160.208.208
cd ~
git clone https://github.com/den1sssss/nodejs-docker-and-compose.git nodejs-docker-and-compose
cd nodejs-docker-and-compose
./auto_deploy.sh
```

### Вариант 2: Ручной деплой

Выполните команды из файла `DEPLOY_COMMANDS.sh` на сервере.

### Вариант 3: Пошаговая инструкция

Следуйте инструкциям в файле `STEP_BY_STEP.md`

## 📋 Минимальный набор команд для сервера:

```bash
# 1. Подключитесь к серверу
ssh root@158.160.208.208

# 2. Склонируйте репозиторий
cd ~
git clone https://github.com/den1sssss/nodejs-docker-and-compose.git nodejs-docker-and-compose
cd nodejs-docker-and-compose

# 3. Создайте .env
cp env.example .env
nano .env  # Установите REACT_APP_API_URL=https://api.sirazovdenis.nomorepartiessbs.ru

# 4. Запустите
docker-compose build --no-cache
docker-compose up -d

# 5. Проверьте
docker-compose ps
docker-compose logs --tail=50
```

## 🌐 Настройка доменов:

После запуска контейнеров настройте Nginx и SSL (см. `STEP_BY_STEP.md`, шаги 9-14):

- Frontend: sirazovdenis.nomorepartiessbs.ru
- Backend: api.sirazovdenis.nomorepartiessbs.ru
- IP: 158.160.208.208

## 📞 Проверка работы:

После деплоя проверьте:
- Frontend: https://sirazovdenis.nomorepartiessbs.ru
- Backend: https://api.sirazovdenis.nomorepartiessbs.ru
