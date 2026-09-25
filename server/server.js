// LUCKIO Backend Server
// Минимальный API для игровой системы

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory хранилище данных
const storage = {
    user: {
        id: 123456789,
        first_name: 'TestUser',
        username: 'test_player'
    },
    balance: 10000,
    history: []
};

// Валидация баланса
function validateBalance(balance) {
    if (typeof balance !== 'number') {
        return { valid: false, error: 'Баланс должен быть числом' };
    }
    if (balance < 0) {
        return { valid: false, error: 'Баланс не может быть отрицательным' };
    }
    return { valid: true };
}

// Валидация ставки
function validateBet(bet, balance) {
    if (typeof bet !== 'number') {
        return { valid: false, error: 'Ставка должна быть числом' };
    }
    if (bet < 0) {
        return { valid: false, error: 'Ставка не может быть отрицательной' };
    }
    if (bet > balance) {
        return { valid: false, error: 'Недостаточно средств для ставки' };
    }
    return { valid: true };
}

// API Routes

// GET /api/health - проверка работы сервера
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'LUCKIO Server is running',
        timestamp: new Date().toISOString()
    });
});

// GET /api/user - получить данные пользователя
app.get('/api/user', (req, res) => {
    res.json({
        success: true,
        user: storage.user
    });
});

// GET /api/user/:telegramId - получить пользователя по Telegram ID
app.get('/api/user/:telegramId', (req, res) => {
    const { telegramId } = req.params;
    
    // Валидация telegramId
    const userId = parseInt(telegramId, 10);
    
    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Некорректный Telegram ID. Должен быть положительным числом'
        });
    }
    
    // Тестовые данные пользователей (in-memory)
    const users = {
        123456789: {
            telegramId: 123456789,
            firstName: 'TestUser',
            lastName: 'Dev',
            username: 'test_player'
        },
        987654321: {
            telegramId: 987654321,
            firstName: 'Иван',
            lastName: 'Петров',
            username: 'ivan_petrov'
        }
    };
    
    // Ищем пользователя
    const user = users[userId];
    
    if (!user) {
        // Если пользователь не найден, создаём нового с дефолтными данными
        const newUser = {
            telegramId: userId,
            firstName: 'User',
            lastName: null,
            username: `user_${userId}`
        };
        
        return res.json({
            success: true,
            user: newUser,
            isNew: true
        });
    }
    
    res.json({
        success: true,
        user: user,
        isNew: false
    });
});

// GET /api/balance - получить баланс
app.get('/api/balance', (req, res) => {
    res.json({
        success: true,
        balance: storage.balance
    });
});

// POST /api/balance - изменить баланс
app.post('/api/balance', (req, res) => {
    const { amount, operation } = req.body;

    // Валидация входных данных
    if (!amount || typeof amount !== 'number') {
        return res.status(400).json({
            success: false,
            error: 'Неверный формат суммы'
        });
    }

    if (!operation || !['add', 'subtract'].includes(operation)) {
        return res.status(400).json({
            success: false,
            error: 'Операция должна быть "add" или "subtract"'
        });
    }

    let newBalance = storage.balance;

    if (operation === 'add') {
        newBalance += amount;
    } else if (operation === 'subtract') {
        // Валидация ставки
        const validation = validateBet(amount, storage.balance);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: validation.error
            });
        }
        newBalance -= amount;
    }

    // Валидация нового баланса
    const balanceValidation = validateBalance(newBalance);
    if (!balanceValidation.valid) {
        return res.status(400).json({
            success: false,
            error: balanceValidation.error
        });
    }

    storage.balance = newBalance;

    res.json({
        success: true,
        balance: storage.balance,
        operation: operation,
        amount: amount
    });
});

// GET /api/history - получить историю игр
app.get('/api/history', (req, res) => {
    res.json({
        success: true,
        history: storage.history,
        count: storage.history.length
    });
});

// POST /api/history - добавить запись в историю
app.post('/api/history', (req, res) => {
    const { game, result, amount } = req.body;

    // Валидация
    if (!game || typeof game !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Название игры обязательно'
        });
    }

    if (!result || !['win', 'lose'].includes(result)) {
        return res.status(400).json({
            success: false,
            error: 'Результат должен быть "win" или "lose"'
        });
    }

    if (!amount || typeof amount !== 'number' || amount < 0) {
        return res.status(400).json({
            success: false,
            error: 'Сумма должна быть положительным числом'
        });
    }

    const historyItem = {
        id: Date.now(),
        game: game,
        result: result,
        amount: amount,
        timestamp: new Date().toISOString()
    };

    storage.history.unshift(historyItem);

    // Ограничиваем историю 50 записями
    if (storage.history.length > 50) {
        storage.history = storage.history.slice(0, 50);
    }

    res.json({
        success: true,
        item: historyItem
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint не найден'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера'
    });
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 LUCKIO Server запущен на порту ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💰 Начальный баланс: ${storage.balance} ⭐`);
    console.log(`🌍 Слушаем на 0.0.0.0:${PORT}`);
});
