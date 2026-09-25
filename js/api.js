// LUCKIO API Client
// Модуль для взаимодействия фронтенда с backend API

class LuckioAPI {
    constructor() {
        // Получаем конфигурацию
        this.config = window.LUCKIO_CONFIG || {
            API_BASE_URL: 'http://localhost:3000',
            API_TIMEOUT: 5000,
            USE_BACKEND: true,
            DEBUG: false
        };
        
        this.baseURL = this.config.API_BASE_URL;
        this.timeout = this.config.API_TIMEOUT;
        this.useBackend = this.config.USE_BACKEND;
        this.debug = this.config.DEBUG;
        
        this.isOnline = false;
        this.lastCheck = null;
        this.checkInterval = 30000; // Проверять доступность каждые 30 секунд
        
        // Проверяем доступность сервера при инициализации
        if (this.useBackend) {
            this.checkHealth();
            // Периодическая проверка
            setInterval(() => this.checkHealth(), this.checkInterval);
        } else {
            this.log('Backend отключен в конфигурации, работаем в offline режиме');
        }
    }

    // Логирование
    log(message, type = 'info') {
        if (this.debug) {
            const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '✅';
            console.log(`${prefix} [LuckioAPI] ${message}`);
        }
    }

    // Fetch с timeout
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    // Проверка здоровья сервера
    async checkHealth() {
        if (!this.useBackend) {
            this.isOnline = false;
            return false;
        }

        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}/api/health`, {
                method: 'GET'
            });
            
            if (response.ok) {
                const wasOffline = !this.isOnline;
                this.isOnline = true;
                this.lastCheck = new Date();
                
                if (wasOffline) {
                    this.log('Backend сервер доступен');
                }
                return true;
            } else {
                this.isOnline = false;
                this.log('Backend сервер вернул ошибку', 'warn');
                return false;
            }
        } catch (error) {
            const wasOnline = this.isOnline;
            this.isOnline = false;
            this.lastCheck = new Date();
            
            if (wasOnline) {
                this.log('Backend сервер недоступен, работаем в offline режиме', 'warn');
            }
            return false;
        }
    }

    // GET запрос с обработкой ошибок
    async get(endpoint) {
        if (!this.useBackend || !this.isOnline) {
            throw new Error('Backend недоступен');
        }

        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            this.log(`GET error: ${endpoint} - ${error.message}`, 'error');
            
            // Если сервер недоступен, помечаем как offline
            if (error.message === 'Request timeout' || error.message.includes('fetch')) {
                this.isOnline = false;
            }
            
            throw error;
        }
    }

    // POST запрос с обработкой ошибок
    async post(endpoint, data) {
        if (!this.useBackend || !this.isOnline) {
            throw new Error('Backend недоступен');
        }

        try {
            const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            this.log(`POST error: ${endpoint} - ${error.message}`, 'error');
            
            // Если сервер недоступен, помечаем как offline
            if (error.message === 'Request timeout' || error.message.includes('fetch')) {
                this.isOnline = false;
            }
            
            throw error;
        }
    }

    // Получить данные пользователя
    async getUser() {
        try {
            return await this.get('/api/user');
        } catch (error) {
            this.log('Не удалось получить данные пользователя', 'warn');
            return null;
        }
    }

    // Получить баланс
    async getBalance() {
        try {
            return await this.get('/api/balance');
        } catch (error) {
            this.log('Не удалось получить баланс', 'warn');
            return null;
        }
    }

    // Добавить звёзды
    async addBalance(amount) {
        try {
            return await this.post('/api/balance', {
                amount: amount,
                operation: 'add'
            });
        } catch (error) {
            this.log(`Не удалось добавить баланс: ${error.message}`, 'warn');
            return null;
        }
    }

    // Снять звёзды
    async subtractBalance(amount) {
        try {
            return await this.post('/api/balance', {
                amount: amount,
                operation: 'subtract'
            });
        } catch (error) {
            this.log(`Не удалось снять баланс: ${error.message}`, 'warn');
            return null;
        }
    }

    // Получить историю
    async getHistory() {
        try {
            return await this.get('/api/history');
        } catch (error) {
            this.log('Не удалось получить историю', 'warn');
            return null;
        }
    }

    // Добавить запись в историю
    async addHistoryItem(game, result, amount) {
        try {
            return await this.post('/api/history', {
                game: game,
                result: result,
                amount: amount
            });
        } catch (error) {
            this.log(`Не удалось добавить запись в историю: ${error.message}`, 'warn');
            return null;
        }
    }

    // Проверить доступность сервера
    isServerOnline() {
        return this.isOnline;
    }

    // Получить статус подключения
    getConnectionStatus() {
        return {
            online: this.isOnline,
            lastCheck: this.lastCheck,
            baseURL: this.baseURL,
            useBackend: this.useBackend
        };
    }

    // Изменить URL API (для смены на продакшен)
    setBaseURL(newURL) {
        this.baseURL = newURL;
        this.log(`API URL изменён на: ${newURL}`);
        // Перепроверяем доступность
        this.checkHealth();
    }
}

// Экспорт для использования в других модулях
window.LuckioAPI = LuckioAPI;
