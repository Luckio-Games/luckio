// LUCKIO - Rocket Game
// Игра Ракетка с множителем и crash-механикой

class RocketGame {
    constructor(app) {
        this.app = app;
        this.currentBet = 100;
        this.multiplier = 1.00;
        this.isPlaying = false;
        this.gameInterval = null;
        this.crashPoint = 1.00;
        this.rocketElement = null;
        this.canvasContext = null;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupBetButtons();
        this.setupGameButtons();
    }

    setupCanvas() {
        const canvas = document.getElementById('rocket-canvas');
        if (!canvas) return;
        
        this.canvasContext = canvas.getContext('2d');
        
        // Устанавливаем размеры canvas
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        this.drawBackground();
    }

    drawBackground() {
        if (!this.canvasContext) return;
        
        const ctx = this.canvasContext;
        const canvas = ctx.canvas;
        
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Сетка
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
        }
        
        for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
        }
    }

    setupBetButtons() {
        const betButtons = document.querySelectorAll('.bet-btn');
        
        betButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const bet = parseInt(btn.dataset.bet);
                
                // Проверка баланса
                if (bet > this.app.balance) {
                    this.app.showNotification('Недостаточно средств', 'error');
                    return;
                }
                
                this.currentBet = bet;
                
                // Обновляем активную кнопку
                betButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Обновляем потенциальный выигрыш
                this.updatePotentialWin();
            });
        });
    }

    setupGameButtons() {
        // Кнопка старта
        const startBtn = document.getElementById('start-rocket-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startGame();
            });
        }

        // Кнопка забрать
        const cashoutBtn = document.getElementById('cashout-btn');
        if (cashoutBtn) {
            cashoutBtn.addEventListener('click', () => {
                this.cashout();
            });
        }

        // Кнопка играть снова
        const playAgainBtn = document.getElementById('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    updatePotentialWin() {
        const potentialValue = document.querySelector('.potential-value');
        if (potentialValue) {
            potentialValue.textContent = `${this.currentBet} ⭐`;
        }
    }

    startGame() {
        // Проверка баланса
        if (this.currentBet > this.app.balance) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }

        // Снимаем ставку
        const success = this.app.removeStars(this.currentBet);
        if (!success) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }

        // КРИТИЧЕСКИ ВАЖНО: Сбрасываем состояние ракеты перед новым запуском
        this.rocketElement = document.getElementById('rocket');
        if (this.rocketElement) {
            // Убираем все старые классы
            this.rocketElement.classList.remove('crashed', 'flying');
            
            // Сбрасываем все inline-стили
            this.rocketElement.style.bottom = '20px';
            this.rocketElement.style.left = '20px';
            this.rocketElement.style.display = '';
            this.rocketElement.style.opacity = '1';
            this.rocketElement.style.transform = '';
            this.rocketElement.style.visibility = 'visible';
        }

        // Очищаем старые частицы
        const particlesContainer = document.getElementById('particles');
        if (particlesContainer) {
            particlesContainer.innerHTML = '';
        }

        // Сбрасываем множитель на UI
        const multiplierValue = document.querySelector('.multiplier-value');
        if (multiplierValue) {
            multiplierValue.textContent = '1.00x';
        }

        // Инициализация игры
        this.isPlaying = true;
        this.multiplier = 1.00;
        this.crashPoint = this.generateCrashPoint();

        // Скрываем панель ставок
        const betPanel = document.getElementById('bet-panel');
        if (betPanel) betPanel.classList.add('hidden');
        
        // Скрываем панель результата если она была видна
        const resultPanel = document.getElementById('result-panel');
        if (resultPanel) resultPanel.classList.add('hidden');
        
        // Показываем панель забора
        const cashoutPanel = document.getElementById('cashout-panel');
        if (cashoutPanel) cashoutPanel.classList.remove('hidden');
        
        // Обновляем информацию о ставке
        const currentBetEl = document.getElementById('current-bet');
        if (currentBetEl) currentBetEl.textContent = this.currentBet;

        // Запускаем ракету
        if (this.rocketElement) this.rocketElement.classList.add('flying');

        // Добавляем glow к множителю
        const multiplierDisplay = document.getElementById('multiplier-display');
        if (multiplierDisplay) multiplierDisplay.classList.add('glow');

        // Запускаем игровой цикл
        this.startGameLoop();

        // Создаём частицы
        this.createParticles();
    }

    generateCrashPoint() {
        // Генерируем случайный crash point с вероятностным распределением
        const random = Math.random();
        
        if (random < 0.30) {
            // 30% шанс crash от 1.00 до 1.50
            return 1.00 + Math.random() * 0.50;
        } else if (random < 0.60) {
            // 30% шанс crash от 1.50 до 2.50
            return 1.50 + Math.random() * 1.00;
        } else if (random < 0.85) {
            // 25% шанс crash от 2.50 до 5.00
            return 2.50 + Math.random() * 2.50;
        } else if (random < 0.95) {
            // 10% шанс crash от 5.00 до 10.00
            return 5.00 + Math.random() * 5.00;
        } else {
            // 5% шанс crash от 10.00 до 20.00
            return 10.00 + Math.random() * 10.00;
        }
    }

    startGameLoop() {
        let startTime = Date.now();
        
        this.gameInterval = setInterval(() => {
            if (!this.isPlaying) return;

            const elapsed = Date.now() - startTime;
            
            // Увеличиваем множитель (быстрее со временем)
            const speed = 0.01 + (elapsed / 100000);
            this.multiplier += speed;

            // Обновляем UI
            this.updateMultiplierDisplay();
            this.updateWinValue();
            this.updateRocketPosition();

            // Проверяем crash
            if (this.multiplier >= this.crashPoint) {
                this.crash();
            }
        }, 50);
    }

    updateMultiplierDisplay() {
        const multiplierValue = document.querySelector('.multiplier-value');
        if (multiplierValue) {
            multiplierValue.textContent = this.multiplier.toFixed(2) + 'x';
        }
    }

    updateWinValue() {
        const winValue = document.getElementById('win-value');
        if (winValue) {
            const currentWin = Math.floor(this.currentBet * this.multiplier);
            winValue.textContent = `${currentWin} ⭐`;
        }
    }

    updateRocketPosition() {
        if (!this.rocketElement) return;

        // Двигаем ракету вверх и вправо
        const progress = Math.min((this.multiplier - 1.00) / 5, 1);
        const x = 20 + (progress * 60);
        const y = 20 + (progress * 60);

        this.rocketElement.style.bottom = `${y}%`;
        this.rocketElement.style.left = `${x}%`;
    }

    cashout() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        clearInterval(this.gameInterval);

        // Рассчитываем выигрыш
        const winAmount = Math.floor(this.currentBet * this.multiplier);

        // Возвращаем выигрыш
        this.app.addStars(winAmount);

        // Добавляем в историю
        this.app.addHistoryItem('Ракетка', 'win', winAmount - this.currentBet);

        // Показываем результат
        this.showResult(true, this.multiplier, winAmount);

        // Останавливаем анимации
        this.stopAnimations();

        // Эффект победы
        this.createWinEffect();
    }

    crash() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        clearInterval(this.gameInterval);

        // Добавляем в историю
        this.app.addHistoryItem('Ракетка', 'lose', this.currentBet);

        // Показываем результат
        this.showResult(false, this.crashPoint, this.currentBet);

        // Останавливаем анимации
        this.stopAnimations();

        // Эффект краша
        this.createCrashEffect();
    }

    stopAnimations() {
        if (this.rocketElement) {
            this.rocketElement.classList.remove('flying');
            this.rocketElement.classList.add('crashed');
        }

        document.getElementById('multiplier-display').classList.remove('glow');
    }

    showResult(isWin, multiplier, amount) {
        // Скрываем панель забора
        document.getElementById('cashout-panel').classList.add('hidden');

        // Показываем панель результата
        const resultPanel = document.getElementById('result-panel');
        resultPanel.classList.remove('hidden');

        // Обновляем информацию
        const resultTitle = document.getElementById('result-title');
        const resultMultiplier = document.getElementById('result-multiplier');
        const resultAmount = document.getElementById('result-amount');

        if (isWin) {
            resultTitle.textContent = 'Победа!';
            resultTitle.className = 'result-title win';
            resultAmount.className = 'result-amount win';
            resultAmount.textContent = `+${amount - this.currentBet} ⭐`;
        } else {
            resultTitle.textContent = 'Проигрыш';
            resultTitle.className = 'result-title lose';
            resultAmount.className = 'result-amount lose';
            resultAmount.textContent = `-${amount} ⭐`;
        }

        resultMultiplier.textContent = multiplier.toFixed(2) + 'x';
    }

    resetGame() {
        // Сброс всех переменных
        this.multiplier = 1.00;
        this.isPlaying = false;

        // Сброс UI
        document.querySelector('.multiplier-value').textContent = '1.00x';
        
        // Скрываем панель результата
        document.getElementById('result-panel').classList.add('hidden');
        
        // Показываем панель ставок
        document.getElementById('bet-panel').classList.remove('hidden');

        // Сброс позиции ракеты и важно: удаляем класс display:none который мог быть добавлен
        if (this.rocketElement) {
            this.rocketElement.style.bottom = '20px';
            this.rocketElement.style.left = '20px';
            this.rocketElement.style.display = ''; // Убираем display none если был
            this.rocketElement.style.opacity = '1'; // Возвращаем видимость
            this.rocketElement.classList.remove('crashed', 'flying');
        }

        // Очищаем частицы
        document.getElementById('particles').innerHTML = '';

        // Перерисовываем фон
        this.drawBackground();

        // Обновляем баланс
        this.app.updateBalance();
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        
        const particleInterval = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(particleInterval);
                return;
            }

            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Позиция ракеты
            const rocket = this.rocketElement;
            const rocketRect = rocket.getBoundingClientRect();
            const containerRect = particlesContainer.getBoundingClientRect();
            
            particle.style.left = (rocketRect.left - containerRect.left + rocketRect.width / 2) + 'px';
            particle.style.top = (rocketRect.top - containerRect.top + rocketRect.height / 2) + 'px';
            particle.style.background = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
            
            particlesContainer.appendChild(particle);

            // Удаляем частицу после анимации
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }, 100);
    }

    createWinEffect() {
        // Создаём много частиц для эффекта победы
        const particlesContainer = document.getElementById('particles');
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.background = '#4ade80';
                particlesContainer.appendChild(particle);

                setTimeout(() => particle.remove(), 2000);
            }, i * 20);
        }
    }

    createCrashEffect() {
        // Screen shake
        const gameArea = document.getElementById('rocket-game-area');
        gameArea.classList.add('shake');
        setTimeout(() => {
            gameArea.classList.remove('shake');
        }, 500);

        // Красные частицы
        const particlesContainer = document.getElementById('particles');
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                if (this.rocketElement) {
                    const rect = this.rocketElement.getBoundingClientRect();
                    const containerRect = particlesContainer.getBoundingClientRect();
                    
                    particle.style.left = (rect.left - containerRect.left) + Math.random() * 50 + 'px';
                    particle.style.top = (rect.top - containerRect.top) + Math.random() * 50 + 'px';
                }
                
                particle.style.background = '#f87171';
                particlesContainer.appendChild(particle);

                setTimeout(() => particle.remove(), 2000);
            }, i * 10);
        }
    }
}

// Экспорт для использования в главном файле
window.RocketGame = RocketGame;
