// LUCKIO Configuration
// Конфигурация для подключения к Backend API

const LUCKIO_CONFIG = {
    // Backend API URL
    // Для локальной разработки: 'http://localhost:3000'
    // Для продакшена: 'https://luckio-api.onrender.com'
    API_BASE_URL: 'https://luckio-api.onrender.com',
    
    // Timeout для запросов (в миллисекундах)
    API_TIMEOUT: 5000,
    
    // Использовать backend API или только localStorage
    USE_BACKEND: true,
    
    // Режим отладки
    DEBUG: true
};

// Экспорт для использования в других модулях
window.LUCKIO_CONFIG = LUCKIO_CONFIG;
