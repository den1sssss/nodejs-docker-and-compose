# KupiPodariDay Backend API

Backend API для сервиса вишлистов KupiPodariDay, построенный на NestJS с TypeORM и PostgreSQL.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- PostgreSQL 12+
- npm или pnpm

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd kupipodariday-backend

# Установка зависимостей
npm install

# Настройка базы данных
# Создайте базу данных PostgreSQL с именем 'kupipodariday'
# Обновите конфигурацию в src/app.module.ts при необходимости

# Запуск в режиме разработки
npm run start:dev
```

### Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=student
DB_PASSWORD=student
DB_DATABASE=kupipodariday

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Application Configuration
PORT=3000
NODE_ENV=development
```

## 📚 API Документация

### Аутентификация

#### Регистрация
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "avatar": "https://example.com/avatar.jpg",
  "about": "About me"
}
```

#### Вход
```http
POST /auth/signin
Content-Type: application/json

{
  "username": "username",
  "password": "password123"
}
```

### Пользователи

#### Получить профиль
```http
GET /users/me
Authorization: Bearer <token>
```

#### Обновить профиль
```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "about": "New about text"
}
```

#### Поиск пользователей
```http
GET /users/search?query=username
Authorization: Bearer <token>
```

#### Получить пользователя по ID
```http
GET /users/:id
Authorization: Bearer <token>
```

### Подарки (Wishes)

#### Получить последние подарки
```http
GET /wishes/latest
```

#### Получить популярные подарки
```http
GET /wishes/popular
```

#### Создать подарок
```http
POST /wishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Gift Name",
  "link": "https://example.com/gift",
  "image": "https://example.com/image.jpg",
  "price": 100.50,
  "description": "Gift description"
}
```

#### Получить подарок по ID
```http
GET /wishes/:id
Authorization: Bearer <token>
```

#### Обновить подарок
```http
PATCH /wishes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Gift Name",
  "price": 150.00
}
```

#### Удалить подарок
```http
DELETE /wishes/:id
Authorization: Bearer <token>
```

#### Скопировать подарок
```http
POST /wishes/:id/copy
Authorization: Bearer <token>
```

### Вишлисты

#### Создать вишлист
```http
POST /wishlists
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Wishlist",
  "description": "My awesome wishlist",
  "image": "https://example.com/wishlist.jpg",
  "items": [1, 2, 3]
}
```

#### Получить все вишлисты
```http
GET /wishlists
Authorization: Bearer <token>
```

#### Получить вишлист по ID
```http
GET /wishlists/:id
Authorization: Bearer <token>
```

#### Обновить вишлист
```http
PATCH /wishlists/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Wishlist Name",
  "items": [1, 2, 3, 4]
}
```

#### Удалить вишлист
```http
DELETE /wishlists/:id
Authorization: Bearer <token>
```

### Взносы (Offers)

#### Создать взнос
```http
POST /offers/:wishId
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 25.00,
  "hidden": false
}
```

#### Получить взносы для подарка
```http
GET /offers/wish/:wishId
Authorization: Bearer <token>
```

## 🛠️ Разработка

### Доступные скрипты

```bash
# Запуск в режиме разработки
npm run start:dev

# Сборка проекта
npm run build

# Запуск в продакшн режиме
npm run start:prod

# Линтинг
npm run lint

# Форматирование кода
npm run format

# Тесты
npm run test
npm run test:watch
npm run test:cov

# База данных
npm run db:migrate
npm run db:generate
npm run db:sync
```

### Структура проекта

```
src/
├── auth/                 # Аутентификация и авторизация
├── users/               # Управление пользователями
├── wishes/              # Управление подарками
├── wishlists/           # Управление вишлистами
├── offers/              # Управление взносами
├── app.controller.ts    # Главный контроллер
├── app.module.ts        # Главный модуль
└── main.ts             # Точка входа
```

## 🔒 Безопасность

- Пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Валидация всех входных данных
- Защита от утечки паролей в API ответах
- CORS настройки для безопасности

## 📊 База данных

Проект использует PostgreSQL с TypeORM. Основные сущности:

- **User** - пользователи
- **Wish** - подарки
- **Wishlist** - вишлисты
- **Offer** - взносы на подарки

## 🧪 Тестирование

```bash
# Запуск unit тестов
npm run test

# Запуск e2e тестов
npm run test:e2e

# Покрытие кода тестами
npm run test:cov
```

## 📝 Лицензия

Этот проект является частью учебного задания.

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории.
