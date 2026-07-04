// ============================================
// СТАТИСТИКА ПОСЕТИТЕЛЕЙ v3.0
// ============================================

(function() {
    'use strict';

    // ============================================
    // ПАРСИНГ USER-AGENT
    // ============================================
    function parseUserAgent(ua) {
        ua = ua || 'Неизвестно';
        
        let os = 'Неизвестно';
        let osVersion = 'Неизвестно';
        
        if (ua.includes('Windows NT 10.0')) { os = 'Windows'; osVersion = '10/11'; }
        else if (ua.includes('Windows NT 6.1')) { os = 'Windows'; osVersion = '7'; }
        else if (ua.includes('Windows NT 6.2')) { os = 'Windows'; osVersion = '8'; }
        else if (ua.includes('Windows NT 6.3')) { os = 'Windows'; osVersion = '8.1'; }
        else if (ua.includes('Mac OS X 10_15')) { os = 'macOS'; osVersion = 'Catalina'; }
        else if (ua.includes('Mac OS X 10_14')) { os = 'macOS'; osVersion = 'Mojave'; }
        else if (ua.includes('Mac OS X 10_13')) { os = 'macOS'; osVersion = 'High Sierra'; }
        else if (ua.includes('Mac OS X 10_12')) { os = 'macOS'; osVersion = 'Sierra'; }
        else if (ua.includes('Mac OS X 10_11')) { os = 'macOS'; osVersion = 'El Capitan'; }
        else if (ua.includes('Mac OS X 10_10')) { os = 'macOS'; osVersion = 'Yosemite'; }
        else if (ua.includes('Mac OS X')) { os = 'macOS'; osVersion = 'Unknown'; }
        else if (ua.includes('Android')) { 
            os = 'Android'; 
            const match = ua.match(/Android\s([\d.]+)/);
            osVersion = match ? match[1] : 'Unknown';
        }
        else if (ua.includes('iPhone OS')) { 
            os = 'iOS'; 
            const match = ua.match(/iPhone OS ([\d_]+)/);
            osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
        }
        else if (ua.includes('iPad')) { 
            os = 'iPadOS'; 
            const match = ua.match(/iPad; CPU OS ([\d_]+)/);
            osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
        }
        else if (ua.includes('Linux')) { os = 'Linux'; osVersion = 'Unknown'; }
        
        // Браузер
        let browser = 'Неизвестно';
        let browserVersion = 'Неизвестно';
        
        if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) {
            browser = 'Chrome';
            const match = ua.match(/Chrome\/([\d.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            const match = ua.match(/Firefox\/([\d.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.includes('Safari') && !ua.includes('Chrome') && !ua.includes('Edg')) {
            browser = 'Safari';
            const match = ua.match(/Version\/([\d.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.includes('Edg')) {
            browser = 'Edge';
            const match = ua.match(/Edg\/([\d.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.includes('OPR') || ua.includes('Opera')) {
            browser = 'Opera';
            const match = ua.match(/OPR\/([\d.]+)/);
            browserVersion = match ? match[1] : 'Unknown';
        }
        
        // Устройство
        let device = 'Desktop';
        let deviceModel = 'Неизвестно';
        
        if (ua.includes('Mobile') && !ua.includes('iPad')) {
            device = 'Mobile';
            if (ua.includes('iPhone')) deviceModel = 'iPhone';
            else if (ua.includes('Android')) {
                const match = ua.match(/Android; ([^;]+);/);
                deviceModel = match ? match[1] : 'Android Device';
            }
        } else if (ua.includes('iPad')) {
            device = 'Tablet';
            deviceModel = 'iPad';
        } else if (ua.includes('Tablet')) {
            device = 'Tablet';
            deviceModel = 'Tablet';
        }
        
        return { os, osVersion, browser, browserVersion, device, deviceModel };
    }

    // ============================================
    // ОПРЕДЕЛЕНИЕ РЕФЕРРЕРА
    // ============================================
    function getReferrer() {
        const ref = document.referrer || 'Прямой переход';
        try {
            const url = new URL(ref);
            const domain = url.hostname;
            
            if (domain.includes('google')) return 'Google';
            if (domain.includes('yandex')) return 'Яндекс';
            if (domain.includes('bing')) return 'Bing';
            if (domain.includes('duckduckgo')) return 'DuckDuckGo';
            if (domain.includes('yahoo')) return 'Yahoo';
            if (domain.includes('facebook') || domain.includes('fb.com')) return 'Facebook';
            if (domain.includes('instagram')) return 'Instagram';
            if (domain.includes('twitter') || domain.includes('x.com')) return 'Twitter/X';
            if (domain.includes('youtube')) return 'YouTube';
            if (domain.includes('t.me') || domain.includes('telegram')) return 'Telegram';
            if (domain.includes('whatsapp')) return 'WhatsApp';
            if (domain.includes('vk.com')) return 'ВКонтакте';
            if (domain.includes('ok.ru')) return 'Одноклассники';
            
            return ref;
        } catch(e) {
            return ref;
        }
    }

    // ============================================
    // ГЛАВНАЯ ФУНКЦИЯ СБОРА СТАТИСТИКИ
    // ============================================
    async function collectStats() {
        try {
            console.log('📊 Начинаем сбор статистики...');
            
            const ua = parseUserAgent(navigator.userAgent);
            const now = new Date();
            const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
            
            // Собираем данные
            const stats = {
                timestamp: now.toISOString(),
                timestampLocal: moscowTime.toLocaleString('ru-RU'),
                
                // Устройство
                os: ua.os,
                osVersion: ua.osVersion,
                browser: ua.browser,
                browserVersion: ua.browserVersion,
                device: ua.device,
                deviceModel: ua.deviceModel,
                
                // Экран
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                pixelRatio: window.devicePixelRatio || 1,
                
                // Страница
                page: window.location.pathname,
                pageTitle: document.title || 'Без заголовка',
                referrer: getReferrer(),
                
                // Язык
                language: navigator.language || 'Неизвестно',
                
                // Дополнительно
                isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Да' : 'Нет'
            };

            console.log('📊 Собраны данные:', stats);

            // ============================================
            // ОТПРАВКА НА CLOUDFLARE WORKER
            // ============================================
            const WORKER_URL = 'https://round-band-482a.portal-rosfin.workers.dev/stats';
            
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stats)
            });
            
            const result = await response.json();
            
            if (result.ok) {
                console.log('✅ Статистика успешно отправлена!');
                console.log('📊 IP посетителя:', result.clientIP);
                if (result.geo) {
                    console.log('📍 Геолокация:', result.geo.country, '→', result.geo.city);
                }
            } else {
                console.error('❌ Ошибка отправки статистики:', result);
            }
            
            return stats;
            
        } catch (error) {
            console.error('❌ Ошибка сбора статистики:', error);
        }
    }

    // ============================================
    // ЗАПУСК СТАТИСТИКИ
    // ============================================
    
    // Ждем полной загрузки страницы
    function initStats() {
        console.log('📊 Инициализация статистики...');
        setTimeout(collectStats, 2000);
    }

    if (document.readyState === 'complete') {
        initStats();
    } else {
        document.addEventListener('DOMContentLoaded', initStats);
    }

    // Отслеживаем переходы в SPA
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            console.log('📊 Обнаружена смена страницы, собираем статистику...');
            setTimeout(collectStats, 2000);
        }
    });
    
    try {
        observer.observe(document, { subtree: true, childList: true });
    } catch (e) {
        console.log('⚠️ MutationObserver не поддерживается');
    }

    console.log('📊 Статистика посетителей активирована!');
    console.log('📊 Бот для статистики: @StatistRosfinBot');

})();