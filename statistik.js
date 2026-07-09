// ============================================
// СТАТИСТИКА ПОСЕТИТЕЛЕЙ v4.1
// ============================================

(function() {
    'use strict';

    // ============================================
    // ОПРЕДЕЛЕНИЕ НОВОГО/СТАРОГО ПОСЕТИТЕЛЯ
    // ============================================

    function getVisitorStatus() {
        try {
            const visitorId = localStorage.getItem('visitor_id');
            const firstVisit = localStorage.getItem('visitor_first_visit');
            
            if (!visitorId) {
                const now = new Date().toISOString();
                localStorage.setItem('visitor_id', Date.now().toString());
                localStorage.setItem('visitor_first_visit', now);
                localStorage.setItem('visitor_last_visit', now);
                return { isNew: true, firstVisit: now };
            } else {
                localStorage.setItem('visitor_last_visit', new Date().toISOString());
                return { isNew: false, firstVisit: firstVisit || new Date().toISOString() };
            }
        } catch (e) {
            return { isNew: true };
        }
    }

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
        let deviceIcon = '🖥️';
        
        if (ua.includes('Mobile') && !ua.includes('iPad')) {
            device = 'Mobile';
            deviceIcon = '📱';
            if (ua.includes('iPhone')) { deviceModel = 'iPhone'; }
            else if (ua.includes('Android')) {
                const match = ua.match(/Android; ([^;]+);/);
                deviceModel = match ? match[1] : 'Android Device';
            }
        } else if (ua.includes('iPad')) {
            device = 'Tablet';
            deviceIcon = '📱';
            deviceModel = 'iPad';
        } else if (ua.includes('Tablet')) {
            device = 'Tablet';
            deviceIcon = '📱';
            deviceModel = 'Tablet';
        }
        
        return { os, osVersion, browser, browserVersion, device, deviceModel, deviceIcon };
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
            const visitor = getVisitorStatus();
            const now = new Date();
            
            const stats = {
                timestamp: now.toISOString(),
                timestampLocal: now.toLocaleString('ru-RU'),
                
                isNew: visitor.isNew,
                
                os: ua.os,
                osVersion: ua.osVersion,
                browser: ua.browser,
                browserVersion: ua.browserVersion,
                device: ua.deviceIcon + ' ' + ua.device,
                deviceModel: ua.deviceModel,
                
                page: window.location.pathname || '/',
                referrer: getReferrer(),
                language: navigator.language || 'Неизвестно',
            };

            console.log('📊 Статус:', stats.isNew ? '🆕 НОВЫЙ' : '🔄 ВЕРНУЛСЯ');
            console.log('📊 Данные:', stats);

            // === ОТПРАВКА НА CLOUDFLARE WORKER ===
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
                console.log(`📊 Посетитель: ${result.isNew ? '🆕 Новый' : '🔄 Вернулся'}`);
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
    
    function initStats() {
        console.log('📊 Инициализация статистики v4.1...');
        setTimeout(collectStats, 1500);
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
            setTimeout(collectStats, 1500);
        }
    });
    
    try {
        observer.observe(document, { subtree: true, childList: true });
    } catch (e) {
        console.log('⚠️ MutationObserver не поддерживается');
    }

    console.log('📊 Статистика посетителей v4.1 активирована!');

})();