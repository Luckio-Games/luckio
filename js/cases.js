// LUCKIO - Cases System
// Система кейсов с лентой и редкостями

class CasesSystem {
    constructor(app) {
        this.app = app;
        
        // Определяем кейсы
        this.cases = {
            starter: {
                id: 'starter',
                name: 'Starter Case',
                price: 100,
                icon: '📦',
                color: '#4facfe',
                description: 'Начальный кейс для новичков'
            },
            lucky: {
                id: 'lucky',
                name: 'Lucky Case',
                price: 250,
                icon: '🍀',
                color: '#51cf66',
                description: 'Удача на твоей стороне'
            },
            epic: {
                id: 'epic',
                name: 'Epic Case',
                price: 500,
                icon: '💎',
                color: '#9f7aea',
                description: 'Эпические награды'
            },
            diamond: {
                id: 'diamond',
                name: 'Diamond Case',
                price: 1000,
                icon: '👑',
                color: '#ffd700',
                description: 'Легендарные сокровища'
            }
        };

        // Редкости
        this.rarities = {
            common: {
                name: 'Common',
                color: '#a0aec0',
                glow: 'rgba(160, 174, 192, 0.3)',
                minMultiplier: 0.5,
                maxMultiplier: 1.5
            },
            rare: {
                name: 'Rare',
                color: '#4facfe',
                glow: 'rgba(79, 172, 254, 0.5)',
                minMultiplier: 1.5,
                maxMultiplier: 3.0
            },
            epic: {
                name: 'Epic',
                color: '#9f7aea',
                glow: 'rgba(159, 122, 234, 0.6)',
                minMultiplier: 3.0,
                maxMultiplier: 6.0
            },
            legendary: {
                name: 'Legendary',
                color: '#ffd700',
                glow: 'rgba(255, 215, 0, 0.8)',
                minMultiplier: 6.0,
                maxMultiplier: 12.0
            }
        };

        // Возможные награды для каждого кейса
        this.caseRewards = {
            starter: [
                { rarity: 'common', chance: 60, items: ['Монета', 'Звездочка', 'Кристалл', 'Камень'] },
                { rarity: 'rare', chance: 30, items: ['Сапфир', 'Рубин', 'Топаз'] },
                { rarity: 'epic', chance: 9, items: ['Изумруд', 'Аметист'] },
                { rarity: 'legendary', chance: 1, items: ['Алмаз'] }
            ],
            lucky: [
                { rarity: 'common', chance: 50, items: ['Клевер', 'Подкова', 'Талисман'] },
                { rarity: 'rare', chance: 35, items: ['Амулет', 'Оберег', 'Медальон'] },
                { rarity: 'epic', chance: 13, items: ['Реликвия', 'Артефакт'] },
                { rarity: 'legendary', chance: 2, items: ['Сокровище'] }
            ],
            epic: [
                { rarity: 'common', chance: 40, items: ['Осколок', 'Фрагмент', 'Частица'] },
                { rarity: 'rare', chance: 40, items: ['Самоцвет', 'Жемчуг', 'Янтарь'] },
                { rarity: 'epic', chance: 17, items: ['Корона', 'Скипетр', 'Держава'] },
                { rarity: 'legendary', chance: 3, items: ['Трофей'] }
            ],
            diamond: [
                { rarity: 'common', chance: 30, items: ['Блеск', 'Сияние', 'Луч'] },
                { rarity: 'rare', chance: 40, items: ['Бриллиант', 'Платина', 'Золото'] },
                { rarity: 'epic', chance: 25, items: ['Сокровище', 'Регалия', 'Драгоценность'] },
                { rarity: 'legendary', chance: 5, items: ['Легенда', 'Мифический камень'] }
            ]
        };

        this.isOpening = false;
        this.init();
    }

    init() {
        this.setupCaseButtons();
    }

    setupCaseButtons() {
        // Кнопки открытия кейсов
        const caseButtons = document.querySelectorAll('.open-case-btn');
        
        caseButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const caseId = btn.dataset.caseId;
                this.openCase(caseId);
            });
        });

        // Кнопка закрытия окна кейса
        const closeCaseBtn = document.getElementById('close-case-opening');
        if (closeCaseBtn) {
            closeCaseBtn.addEventListener('click', () => {
                this.closeCaseOpening();
            });
        }

        // Кнопка повторного открытия
        const openAgainBtn = document.getElementById('open-again-btn');
        if (openAgainBtn) {
            openAgainBtn.addEventListener('click', () => {
                const lastCaseId = this.lastOpenedCase;
                this.closeCaseOpening();
                setTimeout(() => {
                    this.openCase(lastCaseId);
                }, 300);
            });
        }
    }

    openCase(caseId) {
        if (this.isOpening) return;

        const caseData = this.cases[caseId];
        if (!caseData) return;

        // Проверка баланса
        if (this.app.balance < caseData.price) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }

        // Списываем цену
        const success = this.app.removeStars(caseData.price);
        if (!success) {
            this.app.showNotification('Недостаточно средств', 'error');
            return;
        }
        
        this.lastOpenedCase = caseId;

        // Генерируем награду
        const reward = this.generateReward(caseId);

        // Показываем окно открытия
        this.showCaseOpening(caseData, reward);

        // Запускаем анимацию ленты
        setTimeout(() => {
            this.startRollAnimation(caseData, reward);
        }, 500);
    }

    generateReward(caseId) {
        const rewards = this.caseRewards[caseId];
        const random = Math.random() * 100;
        
        let accumulated = 0;
        let selectedRarity = null;

        // Определяем редкость по шансу
        for (const rewardGroup of rewards) {
            accumulated += rewardGroup.chance;
            if (random <= accumulated) {
                selectedRarity = rewardGroup;
                break;
            }
        }

        if (!selectedRarity) {
            selectedRarity = rewards[0]; // fallback
        }

        // Выбираем случайный предмет из редкости
        const item = selectedRarity.items[Math.floor(Math.random() * selectedRarity.items.length)];
        
        // Рассчитываем выигрыш
        const rarity = this.rarities[selectedRarity.rarity];
        const multiplier = rarity.minMultiplier + Math.random() * (rarity.maxMultiplier - rarity.minMultiplier);
        const casePrice = this.cases[caseId].price;
        const winAmount = Math.floor(casePrice * multiplier);

        return {
            item: item,
            rarity: selectedRarity.rarity,
            rarityData: rarity,
            amount: winAmount,
            multiplier: multiplier
        };
    }

    showCaseOpening(caseData, reward) {
        this.isOpening = true;

        const modal = document.getElementById('case-opening-modal');
        const caseName = document.getElementById('opening-case-name');
        
        if (caseName) {
            caseName.textContent = caseData.name;
        }

        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
        }

        // Скрываем панель результата
        const resultPanel = document.getElementById('case-result-panel');
        if (resultPanel) {
            resultPanel.classList.add('hidden');
        }
    }

    startRollAnimation(caseData, finalReward) {
        const track = document.getElementById('items-track');
        if (!track) return;

        // Очищаем трек
        track.innerHTML = '';
        track.style.transform = 'translateX(0)';

        // Генерируем предметы для ленты
        const items = this.generateRollItems(caseData.id, finalReward, 60);

        // Создаём элементы
        items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'roll-item';
            itemEl.dataset.rarity = item.rarity;
            
            itemEl.innerHTML = `
                <div class="item-icon">${this.getItemIcon(item.rarity)}</div>
                <div class="item-name">${item.name}</div>
                <div class="item-amount">${item.amount} ⭐</div>
            `;

            track.appendChild(itemEl);
        });

        // Вычисляем позицию финального предмета
        const itemWidth = 140; // ширина + gap
        const centerOffset = window.innerWidth / 2 - 70; // центрируем
        const finalIndex = 50; // финальный предмет на позиции 50
        const targetPosition = -(finalIndex * itemWidth) + centerOffset;

        // Анимация
        setTimeout(() => {
            track.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
            track.style.transform = `translateX(${targetPosition}px)`;
        }, 100);

        // Показываем результат после анимации
        setTimeout(() => {
            this.showResult(finalReward);
            this.isOpening = false;
        }, 5500);
    }

    generateRollItems(caseId, finalReward, count) {
        const items = [];
        const casePrice = this.cases[caseId].price;

        // Заполняем случайными предметами
        for (let i = 0; i < count; i++) {
            if (i === 50) {
                // На 50-й позиции ставим финальную награду
                items.push({
                    name: finalReward.item,
                    rarity: finalReward.rarity,
                    amount: finalReward.amount
                });
            } else {
                // Генерируем случайный предмет
                const reward = this.generateReward(caseId);
                items.push({
                    name: reward.item,
                    rarity: reward.rarity,
                    amount: reward.amount
                });
            }
        }

        return items;
    }

    getItemIcon(rarity) {
        const icons = {
            common: '⚪',
            rare: '🔵',
            epic: '🟣',
            legendary: '🟡'
        };
        return icons[rarity] || '⚪';
    }

    showResult(reward) {
        const resultPanel = document.getElementById('case-result-panel');
        const itemIcon = document.getElementById('result-item-icon');
        const itemName = document.getElementById('result-item-name');
        const itemRarity = document.getElementById('result-item-rarity');
        const itemAmount = document.getElementById('result-item-amount');

        if (itemIcon) itemIcon.textContent = this.getItemIcon(reward.rarity);
        if (itemName) itemName.textContent = reward.item;
        if (itemRarity) {
            itemRarity.textContent = reward.rarityData.name;
            itemRarity.style.color = reward.rarityData.color;
        }
        if (itemAmount) itemAmount.textContent = `+${reward.amount} ⭐`;

        // Устанавливаем цвет свечения
        if (resultPanel) {
            resultPanel.style.setProperty('--reward-glow', reward.rarityData.glow);
            resultPanel.classList.remove('hidden');
        }

        // Начисляем награду
        this.app.addStars(reward.amount);

        // Добавляем в историю
        const profit = reward.amount - this.cases[this.lastOpenedCase].price;
        this.app.addHistoryItem(
            `${this.cases[this.lastOpenedCase].name}`,
            profit > 0 ? 'win' : 'lose',
            Math.abs(profit)
        );

        // Эффекты по редкости
        this.playRarityEffects(reward.rarity);
    }

    playRarityEffects(rarity) {
        // Частицы
        this.createCaseParticles(rarity);

        // Screen shake для epic и legendary
        if (rarity === 'epic' || rarity === 'legendary') {
            const modal = document.getElementById('case-opening-modal');
            if (modal) {
                modal.classList.add('shake');
                setTimeout(() => modal.classList.remove('shake'), 500);
            }
        }

        // Вибрация
        if (this.app.telegram) {
            if (rarity === 'legendary') {
                this.app.telegram.hapticFeedback('success');
            } else if (rarity === 'epic') {
                this.app.telegram.hapticFeedback('medium');
            }
        }
    }

    createCaseParticles(rarity) {
        const colors = {
            common: '#a0aec0',
            rare: '#4facfe',
            epic: '#9f7aea',
            legendary: '#ffd700'
        };

        const count = rarity === 'legendary' ? 100 : rarity === 'epic' ? 60 : rarity === 'rare' ? 30 : 15;
        const color = colors[rarity];

        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'case-particle';
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
                    animation: caseParticleFloat 2s ease-out forwards;
                    box-shadow: 0 0 10px ${color};
                `;

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * (2000 / count));
        }
    }

    closeCaseOpening() {
        const modal = document.getElementById('case-opening-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        // Обновляем историю на главной
        this.app.updateHistory();
    }
}

// Экспорт
window.CasesSystem = CasesSystem;
