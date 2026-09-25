// LUCKIO - Lucky Dice Game
// Игра в кости с 3D анимацией

class LuckyDiceGame {
    constructor(app) {
        this.app = app;
        this.currentBet = 100;
        this.isRolling = false;
        this.lastResult = null;
        
        // Таблица выплат (множители по выпавшему числу)
        this.payoutTable = {
            1: 0,      // Проигрыш
            2: 0.5,    // Возврат половины
            3: 1,      // Возврат ставки
            4: 2,      // x2
            5: 3,      // x3
            6: 5       // x5 - джекпот!
        };
        
        this.init();
    }

    init() {
        this.setupBetButtons();
        this.setupRollButton();
    }

    setupBetButtons() {
        const betButtons = document.querySelectorAll('.dice-bet-btn');
        
        betButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isRolling) return;
                
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
                
                // Очищаем custom input
                const customInput = document.getElementById('custom-dice-bet-input');
                if (customInput) customInput.value = '';
                
                // Обновляем информацию
                this.updateBetInfo();
            });
        });
        
        // Обработка custom bet input
        const customInput = document.getElementById('custom-dice-bet-input');
        if (customInput) {
            customInput.addEventListener('input', () => {
                const customBet = parseInt(customInput.value);
                
                if (customBet && customBet >= 1) {
                    // Убираем активность со всех кнопок
                    betButtons.forEach(b => b.classList.remove('active'));
                    
                    // Устанавливаем custom ставку
                    this.currentBet = customBet;
                    this.updateBetInfo();
                }
            });
        }
    }

    setupRollButton() {
        const rollBtn = document.getElementById('roll-dice-btn');
        if (rollBtn) {
            rollBtn.addEventListener('click', () => {
                this.rollDice();
            });
        }

        const playAgainBtn = document.getElementById('dice-play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
    }

    updateBetInfo() {
        const currentBetEl = document.getElementById('current-dice-bet');
        if (currentBetEl) {
            currentBetEl.textContent = this.currentBet;
        }
    }

    rollDice() {
        if (this.isRolling) return;

        // Валидация ставки
        if (this.currentBet < 1) {
            this.app.showNotification('Ставка должна быть не меньше 1 ⭐', 'error');
            return;
        }

        if (this.currentBet > this.app.balance) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }

        // Списываем ставку
        const success = this.app.removeStars(this.currentBet);
        if (!success) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }
        
        this.isRolling = true;

        // ВАЖНО: НЕ скрываем панель ставок полностью, только делаем disabled
        const betPanel = document.getElementById('dice-bet-panel');
        if (betPanel) {
            betPanel.style.opacity = '0.5';
            betPanel.style.pointerEvents = 'none';
        }

        // Генерируем результат
        const result = Math.floor(Math.random() * 6) + 1;
        this.lastResult = result;

        // Запускаем анимацию кубика
        this.animateDice(result);

        // Показываем результат после анимации
        setTimeout(() => {
            this.showResult(result);
        }, 3000);
    }

    animateDice(finalNumber) {
        const dice = document.getElementById('dice-3d');
        if (!dice) return;

        // Удаляем предыдущие классы
        dice.className = 'dice-3d';
        
        // Запускаем анимацию вращения
        dice.classList.add('rolling');

        // Через 2.5 секунды показываем финальное число
        setTimeout(() => {
            dice.classList.remove('rolling');
            dice.classList.add(`show-${finalNumber}`);
            
            // Звуковой эффект через вибрацию
            if (this.app.telegram) {
                this.app.telegram.hapticFeedback('medium');
            }
        }, 2500);
    }

    showResult(number) {
        const multiplier = this.payoutTable[number];
        const winAmount = Math.floor(this.currentBet * multiplier);
        const profit = winAmount - this.currentBet;

        // Начисляем выигрыш
        if (winAmount > 0) {
            this.app.addStars(winAmount);
        }

        // Определяем тип результата
        let resultType = 'lose';
        if (number === 6) {
            resultType = 'jackpot';
        } else if (number >= 4) {
            resultType = 'big-win';
        } else if (number === 3) {
            resultType = 'break-even';
        } else if (number === 2) {
            resultType = 'small-loss';
        }

        // Показываем панель результата
        this.displayResult(number, winAmount, profit, resultType);

        // Добавляем в историю
        const isWin = profit > 0;
        this.app.addHistoryItem(
            'Lucky Dice',
            isWin ? 'win' : 'lose',
            Math.abs(profit)
        );

        // Эффекты
        this.playResultEffects(resultType, number);

        this.isRolling = false;
    }

    displayResult(number, winAmount, profit, resultType) {
        const resultPanel = document.getElementById('dice-result-panel');
        const resultTitle = document.getElementById('dice-result-title');
        const resultNumber = document.getElementById('dice-result-number');
        const resultMultiplier = document.getElementById('dice-result-multiplier');
        const resultAmount = document.getElementById('dice-result-amount');

        if (!resultPanel) return;

        // Настройка заголовка
        const titles = {
            'jackpot': '🎉 ДЖЕКПОТ!',
            'big-win': '🎊 БОЛЬШОЙ ВЫИГРЫШ!',
            'break-even': '😐 Возврат ставки',
            'small-loss': '😕 Небольшой проигрыш',
            'lose': '😢 Проигрыш'
        };

        const colors = {
            'jackpot': '#ffd700',
            'big-win': '#4ade80',
            'break-even': '#4facfe',
            'small-loss': '#ffa500',
            'lose': '#f87171'
        };

        if (resultTitle) {
            resultTitle.textContent = titles[resultType];
            resultTitle.style.color = colors[resultType];
        }

        if (resultNumber) {
            resultNumber.textContent = number;
        }

        if (resultMultiplier) {
            const mult = this.payoutTable[number];
            resultMultiplier.textContent = `x${mult.toFixed(1)}`;
        }

        if (resultAmount) {
            resultAmount.textContent = profit >= 0 ? `+${profit} ⭐` : `${profit} ⭐`;
            resultAmount.style.color = profit >= 0 ? '#4ade80' : '#f87171';
        }

        // ВАЖНО: Возвращаем панель ставок в активное состояние
        const betPanel = document.getElementById('dice-bet-panel');
        if (betPanel) {
            betPanel.style.opacity = '1';
            betPanel.style.pointerEvents = 'auto';
        }

        resultPanel.classList.remove('hidden');
        resultPanel.classList.add('show');
    }

    playResultEffects(resultType, number) {
        // Частицы
        const particleCount = {
            'jackpot': 100,
            'big-win': 60,
            'break-even': 20,
            'small-loss': 0,
            'lose': 0
        };

        const colors = {
            'jackpot': '#ffd700',
            'big-win': '#4ade80',
            'break-even': '#4facfe'
        };

        const count = particleCount[resultType] || 0;
        const color = colors[resultType] || '#ffffff';

        if (count > 0) {
            this.createDiceParticles(count, color);
        }

        // Screen shake для больших выигрышей
        if (resultType === 'jackpot' || resultType === 'big-win') {
            const diceArea = document.getElementById('dice-game-area');
            if (diceArea) {
                diceArea.classList.add('shake');
                setTimeout(() => diceArea.classList.remove('shake'), 500);
            }
        }

        // Вибрация
        if (this.app.telegram) {
            if (resultType === 'jackpot') {
                this.app.telegram.hapticFeedback('success');
            } else if (resultType === 'big-win') {
                this.app.telegram.hapticFeedback('heavy');
            }
        }
    }

    createDiceParticles(count, color) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'dice-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${color};
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10001;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: diceParticleFloat 2s ease-out forwards;
                    box-shadow: 0 0 10px ${color};
                `;

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * (2000 / count));
        }
    }

    resetGame() {
        // Скрываем результат
        const resultPanel = document.getElementById('dice-result-panel');
        if (resultPanel) {
            resultPanel.classList.remove('show');
            resultPanel.classList.add('hidden');
        }

        // Показываем панель ставок
        const betPanel = document.getElementById('dice-bet-panel');
        if (betPanel) {
            betPanel.style.opacity = '1';
            betPanel.style.pointerEvents = 'auto';
        }

        // Сбрасываем кубик
        const dice = document.getElementById('dice-3d');
        if (dice) {
            dice.className = 'dice-3d';
        }

        this.isRolling = false;
        this.lastResult = null;
    }
}

// Экспорт
window.LuckyDiceGame = LuckyDiceGame;
