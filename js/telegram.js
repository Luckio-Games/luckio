// LUCKIO - Telegram WebApp Integration
// Модуль для работы с Telegram Mini App API

class TelegramApp {
    constructor() {
        this.isAvailable = false;
        this.webApp = null;
        this.user = null;
        this.theme = null;
        
        this.init();
    }

    init() {
        // Проверяем доступность Telegram WebApp
        if (window.Telegram && window.Telegram.WebApp) {
            this.isAvailable = true;
            this.webApp = window.Telegram.WebApp;
            
            // Инициализация
            this.webApp.ready();
            this.webApp.expand();
            
            // Получаем данные пользователя
            this.user = this.webApp.initDataUnsafe?.user || null;
            
            // Получаем тему
            this.theme = this.webApp.themeParams || null;
            
            // Применяем тему
            this.applyTheme();
            
            // Настройка viewport
            this.setupViewport();
            
            // Настройка кнопок
            this.setupButtons();
            
            console.log('Telegram WebApp initialized', {
                user: this.user,
                theme: this.theme
            });
        } else {
            // DEV режим - Telegram недоступен
            console.log('DEV mode: Telegram WebApp not available');
            this.setupDevMode();
        }
    }

    setupViewport() {
        if (!this.isAvailable) return;
        
        // Включаем вертикальные свайпы
        this.webApp.enableClosingConfirmation();
        
        // Скрываем полосу прокрутки
        document.body.style.overscrollBehavior = 'none';
    }

    setupButtons() {
        if (!this.isAvailable) return;
        
        // Скрываем основную кнопку по умолчанию
        this.webApp.MainButton.hide();
        
        // Скрываем кнопку назад по умолчанию
        this.webApp.BackButton.hide();
    }

    showBackButton(callback) {
        if (!this.isAvailable) return;
        
        this.webApp.BackButton.show();
        this.webApp.BackButton.onClick(callback);
    }

    hideBackButton() {
        if (!this.isAvailable) return;
        
        this.webApp.BackButton.hide();
        this.webApp.BackButton.offClick();
    }

    showMainButton(text, callback) {
        if (!this.isAvailable) return;
        
        this.webApp.MainButton.setText(text);
        this.webApp.MainButton.show();
        this.webApp.MainButton.onClick(callback);
    }

    hideMainButton() {
        if (!this.isAvailable) return;
        
        this.webApp.MainButton.hide();
        this.webApp.MainButton.offClick();
    }

    applyTheme() {
        if (!this.theme) return;
        
        const root = document.documentElement;
        
        // Применяем цвета темы Telegram если они доступны
        if (this.theme.bg_color) {
            root.style.setProperty('--tg-theme-bg-color', this.theme.bg_color);
        }
        if (this.theme.text_color) {
            root.style.setProperty('--tg-theme-text-color', this.theme.text_color);
        }
        if (this.theme.hint_color) {
            root.style.setProperty('--tg-theme-hint-color', this.theme.hint_color);
        }
        if (this.theme.link_color) {
            root.style.setProperty('--tg-theme-link-color', this.theme.link_color);
        }
        if (this.theme.button_color) {
            root.style.setProperty('--tg-theme-button-color', this.theme.button_color);
        }
        if (this.theme.button_text_color) {
            root.style.setProperty('--tg-theme-button-text-color', this.theme.button_text_color);
        }
    }

    setupDevMode() {
        // DEV режим - создаём тестового пользователя
        this.user = {
            id: 123456789,
            first_name: 'Player',
            last_name: null,
            username: 'dev_player',
            photo_url: null,
            is_dev: true
        };
        
        console.log('DEV mode user:', this.user);
    }

    getUserName() {
        if (!this.user) return 'Player';
        
        // Формируем имя пользователя
        if (this.user.first_name && this.user.last_name) {
            return `${this.user.first_name} ${this.user.last_name}`;
        } else if (this.user.first_name) {
            return this.user.first_name;
        } else if (this.user.username) {
            return `@${this.user.username}`;
        }
        
        return 'Player';
    }

    getUserAvatar() {
        // В будущем можно добавить получение аватара через Telegram Bot API
        // Пока возвращаем emoji
        return '👤';
    }

    getUsername() {
        if (!this.user || !this.user.username) return null;
        return `@${this.user.username}`;
    }

    hapticFeedback(type = 'light') {
        if (!this.isAvailable) return;
        
        try {
            if (this.webApp.HapticFeedback) {
                if (type === 'success') {
                    this.webApp.HapticFeedback.notificationOccurred('success');
                } else if (type === 'error') {
                    this.webApp.HapticFeedback.notificationOccurred('error');
                } else if (type === 'warning') {
                    this.webApp.HapticFeedback.notificationOccurred('warning');
                } else if (type === 'heavy') {
                    this.webApp.HapticFeedback.impactOccurred('heavy');
                } else if (type === 'medium') {
                    this.webApp.HapticFeedback.impactOccurred('medium');
                } else {
                    this.webApp.HapticFeedback.impactOccurred('light');
                }
            }
        } catch (e) {
            console.log('Haptic feedback not available');
        }
    }

    close() {
        if (!this.isAvailable) return;
        this.webApp.close();
    }

    openLink(url, options = {}) {
        if (!this.isAvailable) {
            window.open(url, '_blank');
            return;
        }
        
        try {
            this.webApp.openLink(url, options);
        } catch (e) {
            window.open(url, '_blank');
        }
    }

    showPopup(params) {
        if (!this.isAvailable) {
            alert(params.message);
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            this.webApp.showPopup(params, (buttonId) => {
                resolve(buttonId);
            });
        });
    }

    showAlert(message) {
        if (!this.isAvailable) {
            alert(message);
            return Promise.resolve();
        }
        
        return new Promise((resolve) => {
            this.webApp.showAlert(message, () => {
                resolve();
            });
        });
    }

    showConfirm(message) {
        if (!this.isAvailable) {
            return Promise.resolve(confirm(message));
        }
        
        return new Promise((resolve) => {
            this.webApp.showConfirm(message, (result) => {
                resolve(result);
            });
        });
    }

    isDev() {
        return !this.isAvailable || (this.user && this.user.is_dev);
    }

    getPlatform() {
        if (!this.isAvailable) return 'browser';
        return this.webApp.platform || 'unknown';
    }

    getVersion() {
        if (!this.isAvailable) return 'dev';
        return this.webApp.version || 'unknown';
    }

    isVersionAtLeast(version) {
        if (!this.isAvailable) return false;
        return this.webApp.isVersionAtLeast(version);
    }
}

// Экспорт
window.TelegramApp = TelegramApp;
