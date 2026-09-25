// LUCKIO Debug Panel
// Временная диагностическая панель для проверки Telegram и Backend

class DebugPanel {
    constructor() {
        this.telegram = null;
        this.api = null;
        this.panelElement = null;
        
        this.init();
    }

    init() {
        // Ждём, пока загрузятся все необходимые модули
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Небольшая задержка, чтобы TelegramApp и LuckioAPI успели инициализироваться
        setTimeout(() => {
            this.createPanel();
            this.updateData();
        }, 500);
    }

    createPanel() {
        // Создаём панель
        this.panelElement = document.createElement('div');
        this.panelElement.id = 'debug-panel';
        this.panelElement.innerHTML = `
            <div class="debug-header">
                <span class="debug-title">🔍 Debug Panel</span>
                <button class="debug-close" id="debug-close">✕</button>
            </div>
            <div class="debug-content">
                <div class="debug-section">
                    <div class="debug-label">Mode:</div>
                    <div class="debug-value" id="debug-mode">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">Telegram WebApp:</div>
                    <div class="debug-value" id="debug-tg-available">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">Telegram User ID:</div>
                    <div class="debug-value" id="debug-tg-id">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">First Name:</div>
                    <div class="debug-value" id="debug-tg-name">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">Username:</div>
                    <div class="debug-value" id="debug-tg-username">-</div>
                </div>
                <div class="debug-divider"></div>
                <div class="debug-section">
                    <div class="debug-label">Backend:</div>
                    <div class="debug-value" id="debug-backend-status">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">Backend URL:</div>
                    <div class="debug-value small" id="debug-backend-url">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">Backend User:</div>
                    <div class="debug-value" id="debug-backend-user">-</div>
                </div>
                <div class="debug-section">
                    <div class="debug-label">API Errors:</div>
                    <div class="debug-value error" id="debug-api-errors">-</div>
                </div>
            </div>
            <div class="debug-footer">
                <button class="debug-refresh" id="debug-refresh">🔄 Refresh</button>
            </div>
        `;

        document.body.appendChild(this.panelElement);

        // Обработчики кнопок
        document.getElementById('debug-close').addEventListener('click', () => {
            this.panelElement.style.display = 'none';
        });

        document.getElementById('debug-refresh').addEventListener('click', () => {
            this.updateData();
        });
    }

    async updateData() {
        // Получаем ссылки на модули
        this.telegram = window.luckioApp?.telegram || null;
        this.api = window.luckioApp?.telegram?.api || null;

        // Режим работы
        const isDev = !this.telegram?.isAvailable;
        document.getElementById('debug-mode').textContent = isDev ? 'DEV MODE' : 'PRODUCTION';
        document.getElementById('debug-mode').style.color = isDev ? '#f59e0b' : '#4ade80';

        // Telegram WebApp
        const tgAvailable = this.telegram?.isAvailable || false;
        document.getElementById('debug-tg-available').textContent = tgAvailable ? 'YES' : 'NO';
        document.getElementById('debug-tg-available').style.color = tgAvailable ? '#4ade80' : '#f87171';

        // Telegram User ID
        const userId = this.telegram?.user?.id || null;
        const userIdEl = document.getElementById('debug-tg-id');
        userIdEl.textContent = userId ? userId.toString() : 'NOT FOUND';
        userIdEl.style.color = userId ? '#4ade80' : '#f87171';

        // First Name
        const firstName = this.telegram?.user?.first_name || null;
        document.getElementById('debug-tg-name').textContent = firstName || 'NOT FOUND';

        // Username
        const username = this.telegram?.user?.username || null;
        document.getElementById('debug-tg-username').textContent = username ? `@${username}` : 'NOT FOUND';

        // Backend статус
        await this.checkBackend();
    }

    async checkBackend() {
        // Если API недоступен, создаём временный экземпляр
        if (!this.api && window.LuckioAPI) {
            this.api = new window.LuckioAPI();
        }

        if (!this.api) {
            document.getElementById('debug-backend-status').textContent = 'NOT INITIALIZED';
            document.getElementById('debug-backend-status').style.color = '#f87171';
            document.getElementById('debug-backend-url').textContent = 'N/A';
            document.getElementById('debug-backend-user').textContent = 'N/A';
            document.getElementById('debug-api-errors').textContent = 'API not available';
            return;
        }

        // Backend URL
        document.getElementById('debug-backend-url').textContent = this.api.baseURL || 'N/A';

        // Проверяем доступность backend
        try {
            await this.api.checkHealth();
            
            const isOnline = this.api.isServerOnline();
            const statusEl = document.getElementById('debug-backend-status');
            statusEl.textContent = isOnline ? 'ONLINE' : 'OFFLINE';
            statusEl.style.color = isOnline ? '#4ade80' : '#f87171';

            // Проверяем загрузку пользователя
            const backendUser = this.telegram?.backendUser || null;
            const backendUserEl = document.getElementById('debug-backend-user');
            
            if (backendUser) {
                backendUserEl.textContent = 'LOADED';
                backendUserEl.style.color = '#4ade80';
            } else {
                backendUserEl.textContent = isOnline ? 'NOT LOADED' : 'OFFLINE';
                backendUserEl.style.color = isOnline ? '#f59e0b' : '#f87171';
            }

            // Ошибки API
            document.getElementById('debug-api-errors').textContent = isOnline ? 'None' : 'Backend unavailable';
            document.getElementById('debug-api-errors').style.color = isOnline ? '#4ade80' : '#f87171';

        } catch (error) {
            document.getElementById('debug-backend-status').textContent = 'ERROR';
            document.getElementById('debug-backend-status').style.color = '#f87171';
            document.getElementById('debug-backend-user').textContent = 'ERROR';
            document.getElementById('debug-api-errors').textContent = error.message || 'Unknown error';
            document.getElementById('debug-api-errors').style.color = '#f87171';
        }
    }

    show() {
        if (this.panelElement) {
            this.panelElement.style.display = 'block';
            this.updateData();
        }
    }

    hide() {
        if (this.panelElement) {
            this.panelElement.style.display = 'none';
        }
    }
}

// Инициализация Debug Panel
window.debugPanel = new DebugPanel();
