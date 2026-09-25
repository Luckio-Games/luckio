// LUCKIO - Telegram Mini App
// Система управления балансом и историей

class LuckioApp {
    constructor() {
        this.balance = 10000;
        this.history = [];
        this.stats = {
            totalGames: 0,
            totalWins: 0,
            totalEarned: 0,
            totalSpent: 0
        };
        
        this.telegram = null;
        
        this.init();
    }

    init() {
        // Инициализация Telegram WebApp
        this.telegram = new window.TelegramApp();
        
        // Загружаем данные из localStorage
        this.loadData();
        
        // Применяем имя пользователя из Telegram
        this.updateUserInfo();
        
        // Обновляем UI
        this.updateBalance();
        this.updateHistory();
        this.updateStats();
        
        // Навигация
        this.setupNavigation();
        
        // DEV кнопки
        this.setupDevControls();
        
        // Кнопки профиля
        this.setupProfileControls();
        
        // Инициализация игр
        this.setupGames();
        
        // Инициализация системы кейсов
        this.setupCases();
    }

    // Обновление информации о пользователе
    updateUserInfo() {
        const userName = this.telegram.getUserName();
        const userAvatar = this.telegram.getUserAvatar();
        
        // Обновляем имя в профиле
        const profileName = document.querySelector('.profile-name');
        if (profileName) {
            profileName.textContent = userName;
        }
        
        // Обновляем аватар
        const profileAvatar = document.querySelector('.profile-avatar');
        if (profileAvatar) {
            profileAvatar.textContent = userAvatar;
        }
    }

    // Загрузка данных из localStorage
    loadData() {
        const savedData = localStorage.getItem('luckio_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.balance = data.balance || 10000;
                this.history = data.history || [];
                this.stats = data.stats || {
                    totalGames: 0,
                    totalWins: 0,
                    totalEarned: 0,
                    totalSpent: 0
                };
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
    }

    // Сохранение данных в localStorage
    saveData() {
        const data = {
            balance: this.balance,
            history: this.history,
            stats: this.stats
        };
        localStorage.setItem('luckio_data', JSON.stringify(data));
    }

    // Обновление баланса на всех страницах
    updateBalance() {
        // Защита от отрицательного баланса
        if (this.balance < 0) {
            this.balance = 0;
        }

        const balanceElements = [
            document.getElementById('balance'),
            document.getElementById('balance-games'),
            document.getElementById('balance-cases'),
            document.getElementById('balance-profile'),
            document.getElementById('balance-rocket'),
            document.getElementById('balance-dice')
        ];

        balanceElements.forEach(element => {
            if (element) {
                element.textContent = this.balance.toLocaleString('ru-RU');
                
                // Анимация при изменении
                element.classList.add('balance-update');
                setTimeout(() => {
                    element.classList.remove('balance-update');
                }, 500);
            }
        });
    }

    // Добавление звёзд
    addStars(amount) {
        this.balance += amount;
        // Защита от отрицательного баланса
        if (this.balance < 0) {
            this.balance = 0;
        }
        this.updateBalance();
        this.saveData();
        
        // Показываем уведомление
        this.showNotification(`+${amount} ⭐`, 'success');
    }

    // Снятие звёзд
    removeStars(amount) {
        // Проверка на достаточность средств
        if (this.balance >= amount && amount > 0) {
            this.balance -= amount;
            // Защита от отрицательного баланса
            if (this.balance < 0) {
                this.balance = 0;
            }
            this.updateBalance();
            this.saveData();
            return true;
        }
        return false;
    }

    // Добавление записи в историю
    addHistoryItem(game, result, amount) {
        const item = {
            id: Date.now(),
            game: game,
            result: result,
            amount: amount,
            timestamp: new Date().toLocaleString('ru-RU')
        };

        this.history.unshift(item);
        
        // Ограничиваем историю 50 записями
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }

        // Обновляем статистику
        this.stats.totalGames++;
        if (result === 'win') {
            this.stats.totalWins++;
            this.stats.totalEarned += amount;
        } else {
            this.stats.totalSpent += amount;
        }

        this.updateHistory();
        this.updateStats();
        this.saveData();
    }

    // Обновление отображения истории
    updateHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        if (this.history.length === 0) {
            historyList.innerHTML = '<div class="history-empty">История пуста</div>';
            return;
        }

        // Показываем последние 10 записей
        const recentHistory = this.history.slice(0, 10);
        
        historyList.innerHTML = recentHistory.map(item => `
            <div class="history-item">
                <div>
                    <div class="history-game">${item.game}</div>
                    <div class="history-result">${item.timestamp}</div>
                </div>
                <div class="history-amount ${item.result}">
                    ${item.result === 'win' ? '+' : '-'}${item.amount} ⭐
                </div>
            </div>
        `).join('');
    }

    // Обновление статистики
    updateStats() {
        // Основная статистика
        const statsElements = {
            'total-games': this.stats.totalGames,
            'total-wins': this.stats.totalWins,
            'total-earned': this.stats.totalEarned,
            'total-spent': this.stats.totalSpent
        };

        Object.keys(statsElements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = statsElements[id].toLocaleString('ru-RU');
            }
        });

        // Дополнительная статистика для профиля
        const totalLosses = this.stats.totalGames - this.stats.totalWins;
        const winRate = this.stats.totalGames > 0 
            ? Math.round((this.stats.totalWins / this.stats.totalGames) * 100) 
            : 0;
        const netProfit = this.stats.totalEarned - this.stats.totalSpent;

        const lossesEl = document.getElementById('total-losses');
        if (lossesEl) lossesEl.textContent = totalLosses;

        const winRateEl = document.getElementById('win-rate');
        if (winRateEl) winRateEl.textContent = winRate + '%';

        const earnedEl = document.getElementById('total-earned');
        if (earnedEl && earnedEl.closest('.financial-value')) {
            earnedEl.textContent = this.stats.totalEarned.toLocaleString('ru-RU') + ' ⭐';
        }

        const spentEl = document.getElementById('total-spent');
        if (spentEl && spentEl.closest('.financial-value')) {
            spentEl.textContent = this.stats.totalSpent.toLocaleString('ru-RU') + ' ⭐';
        }

        const netProfitEl = document.getElementById('net-profit');
        if (netProfitEl) {
            netProfitEl.textContent = (netProfit >= 0 ? '+' : '') + netProfit.toLocaleString('ru-RU') + ' ⭐';
            netProfitEl.style.color = netProfit >= 0 ? '#4ade80' : '#f87171';
        }

        // Обновляем полную историю
        this.updateFullHistory();
    }

    // Обновление полной истории в профиле
    updateFullHistory(filter = 'all') {
        const fullHistoryList = document.getElementById('full-history-list');
        if (!fullHistoryList) return;

        if (this.history.length === 0) {
            fullHistoryList.innerHTML = '<div class="history-empty">История пуста</div>';
            return;
        }

        // Фильтрация
        let filteredHistory = this.history;
        if (filter === 'win') {
            filteredHistory = this.history.filter(item => item.result === 'win');
        } else if (filter === 'lose') {
            filteredHistory = this.history.filter(item => item.result === 'lose');
        }

        if (filteredHistory.length === 0) {
            fullHistoryList.innerHTML = '<div class="history-empty">Нет записей</div>';
            return;
        }

        fullHistoryList.innerHTML = filteredHistory.map(item => `
            <div class="history-detail-item ${item.result}">
                <div class="history-header">
                    <span class="history-game-name">${item.game}</span>
                    <span class="history-timestamp">${item.timestamp}</span>
                </div>
                <div class="history-details">
                    <span class="history-result-label">${item.result === 'win' ? 'Выигрыш' : 'Проигрыш'}</span>
                    <span class="history-amount-display ${item.result}">
                        ${item.result === 'win' ? '+' : '-'}${item.amount} ⭐
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Очистка истории
    clearHistory() {
        if (confirm('Очистить всю историю игр?')) {
            this.history = [];
            this.updateHistory();
            this.saveData();
            this.showNotification('История очищена', 'success');
        }
    }

    // Полный сброс
    resetAll() {
        if (confirm('Сбросить весь прогресс? Это действие нельзя отменить!')) {
            this.balance = 10000;
            this.history = [];
            this.stats = {
                totalGames: 0,
                totalWins: 0,
                totalEarned: 0,
                totalSpent: 0
            };
            
            this.updateBalance();
            this.updateHistory();
            this.updateStats();
            this.saveData();
            
            this.showNotification('Прогресс сброшен', 'success');
        }
    }

    // Навигация между страницами
    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageId = button.dataset.page;
                
                // Скрываем все страницы
                document.querySelectorAll('.page').forEach(page => {
                    page.classList.remove('active');
                });
                
                // Показываем выбранную страницу
                const selectedPage = document.getElementById(pageId);
                if (selectedPage) {
                    selectedPage.classList.add('active');
                }
                
                // Обновляем активную кнопку
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Вибрация (если доступна)
                if (this.telegram) {
                    this.telegram.hapticFeedback('light');
                }
            });
        });
    }

    // DEV контролы
    setupDevControls() {
        const addStarsBtn = document.getElementById('add-stars');
        const resetBtn = document.getElementById('reset-progress');

        if (addStarsBtn) {
            addStarsBtn.addEventListener('click', () => {
                this.addStars(1000);
                
                // Вибрация
                if (this.telegram) {
                    this.telegram.hapticFeedback('success');
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAll();
            });
        }
    }

    // Контролы профиля
    setupProfileControls() {
        const clearHistoryBtn = document.getElementById('clear-history');
        const resetAllBtn = document.getElementById('reset-all');
        
        // Новые кнопки в профиле
        const clearHistoryProfileBtn = document.getElementById('clear-history-profile');
        const resetAllProfileBtn = document.getElementById('reset-all-profile');

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        if (resetAllBtn) {
            resetAllBtn.addEventListener('click', () => {
                this.resetAll();
            });
        }

        if (clearHistoryProfileBtn) {
            clearHistoryProfileBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }

        if (resetAllProfileBtn) {
            resetAllProfileBtn.addEventListener('click', () => {
                this.resetAll();
            });
        }

        // Фильтры истории
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                
                // Обновляем активную кнопку
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Обновляем историю с фильтром
                this.updateFullHistory(filter);
            });
        });
    }

    // Инициализация игр
    setupGames() {
        // Кнопки запуска игры Ракетка
        const playRocketBtn = document.getElementById('play-rocket');
        const playRocketGamesBtn = document.getElementById('play-rocket-games');
        const backFromRocketBtn = document.getElementById('back-from-rocket');

        if (playRocketBtn) {
            playRocketBtn.addEventListener('click', () => {
                this.openRocketGame();
            });
        }

        if (playRocketGamesBtn) {
            playRocketGamesBtn.addEventListener('click', () => {
                this.openRocketGame();
            });
        }

        if (backFromRocketBtn) {
            backFromRocketBtn.addEventListener('click', () => {
                this.closeRocketGame();
            });
        }

        // Кнопки запуска игры Lucky Dice
        const playDiceBtn = document.getElementById('play-dice');
        const playDiceGamesBtn = document.getElementById('play-dice-games');
        const backFromDiceBtn = document.getElementById('back-from-dice');

        if (playDiceBtn) {
            playDiceBtn.addEventListener('click', () => {
                this.openDiceGame();
            });
        }

        if (playDiceGamesBtn) {
            playDiceGamesBtn.addEventListener('click', () => {
                this.openDiceGame();
            });
        }

        if (backFromDiceBtn) {
            backFromDiceBtn.addEventListener('click', () => {
                this.closeDiceGame();
            });
        }
    }

    // Открыть игру Ракетка
    openRocketGame() {
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Показываем страницу игры
        const rocketPage = document.getElementById('rocket-game-page');
        if (rocketPage) {
            rocketPage.classList.add('active');
        }

        // Инициализируем игру, если ещё не создана
        if (!this.rocketGame) {
            this.rocketGame = new window.RocketGame(this);
        } else {
            // Обновляем баланс при входе
            this.updateBalance();
        }

        // Скрываем нижнюю навигацию
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Показываем Telegram BackButton
        if (this.telegram) {
            this.telegram.showBackButton(() => {
                this.closeRocketGame();
            });
        }
    }

    // Закрыть игру Ракетка
    closeRocketGame() {
        // Возвращаемся на главную
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.classList.add('active');
        }

        // Показываем нижнюю навигацию
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }

        // Обновляем навигацию
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const homeBtn = document.querySelector('.nav-btn[data-page="home-page"]');
        if (homeBtn) homeBtn.classList.add('active');

        // Обновляем историю
        this.updateHistory();

        // Скрываем Telegram BackButton
        if (this.telegram) {
            this.telegram.hideBackButton();
        }
    }

    // Открыть игру Lucky Dice
    openDiceGame() {
        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Показываем страницу игры
        const dicePage = document.getElementById('dice-game-page');
        if (dicePage) {
            dicePage.classList.add('active');
        }

        // Инициализируем игру, если ещё не создана
        if (!this.diceGame) {
            this.diceGame = new window.LuckyDiceGame(this);
        } else {
            // Обновляем баланс при входе
            this.updateBalance();
        }

        // Скрываем нижнюю навигацию
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }

        // Показываем Telegram BackButton
        if (this.telegram) {
            this.telegram.showBackButton(() => {
                this.closeDiceGame();
            });
        }
    }

    // Закрыть игру Lucky Dice
    closeDiceGame() {
        // Возвращаемся на главную
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const homePage = document.getElementById('home-page');
        if (homePage) {
            homePage.classList.add('active');
        }

        // Показываем нижнюю навигацию
        const bottomNav = document.querySelector('.bottom-nav');
        if (bottomNav) {
            bottomNav.style.display = 'flex';
        }

        // Обновляем навигацию
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const homeBtn = document.querySelector('.nav-btn[data-page="home-page"]');
        if (homeBtn) homeBtn.classList.add('active');

        // Обновляем историю
        this.updateHistory();

        // Скрываем Telegram BackButton
        if (this.telegram) {
            this.telegram.hideBackButton();
        }
    }

    // Инициализация системы кейсов
    setupCases() {
        // Создаём систему кейсов
        if (window.CasesSystem) {
            this.casesSystem = new window.CasesSystem(this);
        }
    }

    // Показ уведомления
    showNotification(message, type = 'info') {
        // Создаём элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const bgColor = type === 'success' ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' : 
                        type === 'error' ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${bgColor};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 14px;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        // Удаляем через 2 секунды
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// Добавляем стили для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }

    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }

    .balance-update {
        animation: balancePulse 0.5s ease;
    }

    @keyframes balancePulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
    }
`;
document.head.appendChild(style);

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.luckioApp = new LuckioApp();
    console.log('LUCKIO App initialized!');
});
