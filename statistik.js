// ============================================
// СТАТИСТИКА ПОСЕТИТЕЛЕЙ v4.3
// ============================================

(function() {
    'use strict';

    // Определение нового/старого посетителя
    function getVisitorStatus() {
        try {
            const visitorId = localStorage.getItem('visitor_id');
            if (!visitorId) {
                localStorage.setItem('visitor_id', Date.now().toString());
                localStorage.setItem('visitor_first_visit', new Date().toISOString());
                return { isNew: true };
            } else {
                return { isNew: false };
            }
        } catch (e) {
            return { isNew: true };
        }
    }

    // Парсинг User-Agent
    function getDeviceInfo() {
        const ua = navigator.userAgent || '';
        let device = 'Desktop';
        let deviceModel = 'Неизвестно';
        let deviceIcon = '🖥️';
        let os = 'Неизвестно';
        let browser = 'Неизвестно';

        if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
            device = 'Mobile';
            deviceIcon = '📱';
            if (ua.includes('iPhone')) deviceModel = 'iPhone';
            else if (ua.includes('Android')) {
                const match = ua.match(/Android; ([^;]+);/);
                deviceModel = match ? match[1] : 'Android';
            }
        }
        if (ua.includes('iPad')) { device = 'Tablet'; deviceIcon = '📱'; deviceModel = 'iPad'; }

        if (ua.includes('Windows')) os = 'Windows';
        else if (ua.includes('Mac OS X')) os = 'macOS';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
        else if (ua.includes('Linux')) os = 'Linux';

        if (ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edg')) browser = 'Edge';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('OPR') || ua.includes('Opera')) browser = 'Opera';

        return { device: deviceIcon + ' ' + device, deviceModel, os, browser };
    }

    // Главная функция
    async function collectStats() {
        try {
            const visitor = getVisitorStatus();
            const device = getDeviceInfo();
            const now = new Date();

            const stats = {
                isNew: visitor.isNew,
                timestampLocal: now.toLocaleString('ru-RU'),
                page: window.location.pathname || '/',
                device: device.device,
                deviceModel: device.deviceModel,
                os: device.os,
                browser: device.browser,
            };

            console.log('📊 Отправка статистики:', stats);

            // === ИСПРАВЛЕННЫЙ URL ===
            const response = await fetch('https://round-band-482a.portal-rosfin.workers.dev/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stats)
            });

            const result = await response.json();
            if (result.ok) {
                console.log('✅ Статистика отправлена! Посетитель:', result.isNew ? '🆕 Новый' : '🔄 Вернулся');
            } else {
                console.error('❌ Ошибка:', result);
            }
        } catch (error) {
            console.error('❌ Ошибка сбора статистики:', error);
        }
    }

    // Запуск
    setTimeout(collectStats, 1500);

    // При смене страницы
    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(collectStats, 1500);
        }
    }, 1000);

    console.log('📊 Статистика v4.3 запущена!');

})();