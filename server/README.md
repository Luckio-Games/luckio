# LUCKIO Server

Backend API для Telegram Mini App LUCKIO

## 🚀 Локальный запуск

### Установка зависимостей
```bash
cd server
npm install
```

### Запуск сервера

**Production режим:**
```bash
npm start
```

**Development режим (с автоперезагрузкой):**
```bash
npm run dev
```

Сервер запустится на `http://localhost:3000`

## ☁️ Развертывание на Render

### Требования
- Аккаунт на [Render](https://render.com)
- GitHub репозиторий с проектом

### Шаги развертывания

1. **Создай новый Web Service на Render:**
   - Зайди на https://dashboard.render.com
   - Нажми "New +" → "Web Service"
   - Подключи свой GitHub репозиторий

2. **Настройки для Render:**

   | Параметр | Значение |
   |----------|----------|
   | **Name** | `luckio-api` (или любое имя) |
   | **Environment** | `Node` |
   | **Region** | Выбери ближайший регион |
   | **Branch** | `main` |
   | **Root Directory** | `server` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

3. **Environment Variables (не требуется для базовой версии)**
   - PORT - автоматически устанавливается Render
   - Другие переменные пока не нужны

4. **Нажми "Create Web Service"**

5. **Дождись деплоя** (обычно 2-3 минуты)

6. **Получи URL своего API:**
   - Формат: `https://your-service-name.onrender.com`
   - Пример: `https://luckio-api.onrender.com`

### Проверка работы

После деплоя проверь health endpoint:
```bash
curl https://your-service-name.onrender.com/api/health
```

Должен вернуться JSON:
```json
{
  "status": "ok",
  "message": "LUCKIO Server is running",
  "timestamp": "2026-09-25T13:39:02.430Z"
}
```

### Обновление Frontend

После деплоя на Render обнови `js/config.js` в frontend:
```javascript
API_BASE_URL: 'https://your-service-name.onrender.com'
```

## 📡 API Endpoints

### GET /api/health
Проверка работы сервера
```json
{
  "status": "ok",
  "message": "LUCKIO Server is running",
  "timestamp": "2026-09-25T13:39:02.430Z"
}
```

### GET /api/user
Получить данные пользователя
```json
{
  "success": true,
  "user": {
    "id": 123456789,
    "first_name": "TestUser",
    "username": "test_player"
  }
}
```

### GET /api/balance
Получить баланс
```json
{
  "success": true,
  "balance": 10000
}
```

### POST /api/balance
Изменить баланс
```json
// Request
{
  "amount": 100,
  "operation": "add" // или "subtract"
}

// Response
{
  "success": true,
  "balance": 10100,
  "operation": "add",
  "amount": 100
}
```

### GET /api/history
Получить историю игр
```json
{
  "success": true,
  "history": [],
  "count": 0
}
```

### POST /api/history
Добавить запись в историю
```json
// Request
{
  "game": "Ракетка",
  "result": "win", // или "lose"
  "amount": 200
}

// Response
{
  "success": true,
  "item": {
    "id": 1727270936565,
    "game": "Ракетка",
    "result": "win",
    "amount": 200,
    "timestamp": "2026-09-25T13:39:02.430Z"
  }
}
```

## 🔒 Валидация

- ✅ Баланс не может быть отрицательным
- ✅ Ставка не может быть отрицательной
- ✅ Нельзя поставить больше баланса
- ✅ Неправильные данные отклоняются с ошибкой

## 💾 Хранилище

Данные хранятся в памяти сервера (in-memory). 

⚠️ **Важно:** При перезапуске сервера на Render все данные сбрасываются. Это нормально для тестовой версии.

## 🌍 CORS

CORS настроен для всех источников. Frontend с любого домена (включая GitHub Pages) может обращаться к API.

## 🔧 Технические детали

- **Порт:** Берется из переменной окружения `PORT` (Render устанавливает автоматически), иначе `3000`
- **Слушает на:** `0.0.0.0` (обязательно для Render)
- **Node.js версия:** Любая современная (14+)
- **Зависимости:** Express 4.18.2, CORS 2.8.5

## ⚡ Free Tier на Render

Бесплатный план Render:
- ✅ 750 часов в месяц
- ✅ Автоматический SSL
- ⚠️ Сервер засыпает после 15 минут неактивности
- ⚠️ Холодный старт ~30 секунд

Первый запрос после сна будет медленным - это нормально.

## 🚫 Что НЕ реализовано

- База данных (данные в памяти)
- Авторизация пользователей
- Telegram Stars интеграция
- Платежные системы
- Постоянное хранилище

Это минимальная версия для тестирования и прототипирования.
