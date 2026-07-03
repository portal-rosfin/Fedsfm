// ============================================
// МАКСИМАЛЬНАЯ СТАТИСТИКА ПОСЕТИТЕЛЕЙ v2.0
// ============================================

async function getGeoInfo(ip) {
  try {
    // Используем ip-api.com для геолокации
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || 'Неизвестно',
        countryCode: data.countryCode || '??',
        region: data.regionName || 'Неизвестно',
        regionCode: data.region || '??',
        city: data.city || 'Неизвестно',
        zip: data.zip || 'Неизвестно',
        lat: data.lat || null,
        lon: data.lon || null,
        timezone: data.timezone || 'Неизвестно',
        isp: data.isp || 'Неизвестно',
        org: data.org || 'Неизвестно',
        as: data.as || 'Неизвестно',
        asname: data.asname || 'Неизвестно',
        isMobile: data.mobile || false,
        isProxy: data.proxy || false,
        isHosting: data.hosting || false
      };
    }
    return null;
  } catch (e) {
    console.error('Geo API error:', e);
    return null;
  }
}

function parseUserAgent(ua) {
  ua = ua || 'Неизвестно';
  
  // Определяем ОС
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
  else if (ua.includes('Android')) { os = 'Android'; 
    const match = ua.match(/Android\s([\d.]+)/);
    osVersion = match ? match[1] : 'Unknown';
  }
  else if (ua.includes('iPhone OS')) { os = 'iOS'; 
    const match = ua.match(/iPhone OS ([\d_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
  }
  else if (ua.includes('iPad')) { os = 'iPadOS'; 
    const match = ua.match(/iPad; CPU OS ([\d_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : 'Unknown';
  }
  else if (ua.includes('Linux')) { os = 'Linux'; osVersion = 'Unknown'; }
  
  // Определяем браузер и версию
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
  
  // Определяем тип устройства
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
  
  return { 
    os, 
    osVersion, 
    browser, 
    browserVersion, 
    device, 
    deviceModel 
  };
}

function getScreenInfo() {
  return {
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight
  };
}

function getPerformanceMetrics() {
  try {
    const perf = performance.now();
    const nav = performance.navigation || {};
    return {
      loadTime: perf,
      navigationType: nav.type === 0 ? 'Переход' : nav.type === 1 ? 'Перезагрузка' : 'Обратно',
      redirectCount: nav.redirectCount || 0
    };
  } catch(e) {
    return { loadTime: 0, navigationType: 'Неизвестно', redirectCount: 0 };
  }
}

function getPlugins() {
  try {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins.slice(0, 5);
  } catch(e) {
    return [];
  }
}

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
    
    return ref;
  } catch(e) {
    return ref;
  }
}

function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || 'Не указан',
    medium: params.get('utm_medium') || 'Не указан',
    campaign: params.get('utm_campaign') || 'Не указан',
    term: params.get('utm_term') || 'Не указан',
    content: params.get('utm_content') || 'Не указан'
  };
}

function getClientInfo() {
  return {
    language: navigator.language || 'Неизвестно',
    languages: navigator.languages || [],
    doNotTrack: navigator.doNotTrack || 'Не указан',
    cookieEnabled: navigator.cookieEnabled ? 'Да' : 'Нет',
    hardwareConcurrency: navigator.hardwareConcurrency || 'Неизвестно',
    deviceMemory: navigator.deviceMemory || 'Неизвестно',
    connection: navigator.connection ? {
      downlink: navigator.connection.downlink || 'Неизвестно',
      effectiveType: navigator.connection.effectiveType || 'Неизвестно',
      rtt: navigator.connection.rtt || 'Неизвестно'
    } : null
  };
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ
// ============================================

async function collectFullStats() {
  try {
    // IP
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    
    // Гео
    const geo = await getGeoInfo(ip);
    
    // User-Agent
    const ua = parseUserAgent(navigator.userAgent);
    
    // Экран
    const screen = getScreenInfo();
    
    // Производительность
    const perf = getPerformanceMetrics();
    
    // Плагины
    const plugins = getPlugins();
    
    // Клиент
    const client = getClientInfo();
    
    // Время
    const now = new Date();
    const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    
    // Собираем ВСЁ
    const stats = {
      ip: ip,
      timestamp: now.toISOString(),
      timestampLocal: moscowTime.toLocaleString('ru-RU'),
      
      // Гео (ВСЁ)
      country: geo?.country || 'Неизвестно',
      countryCode: geo?.countryCode || '??',
      region: geo?.region || 'Неизвестно',
      regionCode: geo?.regionCode || '??',
      city: geo?.city || 'Неизвестно',
      zip: geo?.zip || 'Неизвестно',
      lat: geo?.lat || null,
      lon: geo?.lon || null,
      timezone: geo?.timezone || 'Неизвестно',
      isp: geo?.isp || 'Неизвестно',
      org: geo?.org || 'Неизвестно',
      as: geo?.as || 'Неизвестно',
      asname: geo?.asname || 'Неизвестно',
      isMobile: geo?.isMobile || false,
      isProxy: geo?.isProxy || false,
      isHosting: geo?.isHosting || false,
      
      // Устройство (ВСЁ)
      os: ua.os,
      osVersion: ua.osVersion,
      browser: ua.browser,
      browserVersion: ua.browserVersion,
      device: ua.device,
      deviceModel: ua.deviceModel,
      
      // Экран (ВСЁ)
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenAvailWidth: screen.availWidth,
      screenAvailHeight: screen.availHeight,
      screenColorDepth: screen.colorDepth,
      pixelRatio: screen.pixelRatio,
      windowWidth: screen.windowWidth,
      windowHeight: screen.windowHeight,
      
      // Страница
      page: window.location.pathname + window.location.search,
      pageTitle: document.title || 'Без заголовка',
      pageUrl: window.location.href,
      referrer: getReferrer(),
      
      // UTM
      utm: getUTMParams(),
      
      // Производительность
      loadTime: Math.round(perf.loadTime),
      navigationType: perf.navigationType,
      redirectCount: perf.redirectCount,
      
      // Клиент
      language: client.language,
      languages: client.languages.join(', '),
      doNotTrack: client.doNotTrack,
      cookieEnabled: client.cookieEnabled,
      hardwareConcurrency: client.hardwareConcurrency,
      deviceMemory: client.deviceMemory,
      connectionType: client.connection?.effectiveType || 'Неизвестно',
      connectionSpeed: client.connection?.downlink || 'Неизвестно',
      connectionRTT: client.connection?.rtt || 'Неизвестно',
      
      // Плагины
      plugins: plugins.join(', '),
      
      // Дополнительно
      isPrivate: window.navigator?.storage?.persisted === false ? 'Возможно инкогнито' : 'Нет',
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Да' : 'Нет'
    };
    
    // ============================================
    // ОТПРАВКА ЧЕРЕЗ CLOUDFLARE WORKER
    // ============================================
    await sendStatsToWorker(stats);
    
    // Сохраняем локально
    const history = JSON.parse(localStorage.getItem('statsHistory') || '[]');
    history.push(stats);
    if (history.length > 100) history.shift();
    localStorage.setItem('statsHistory', JSON.stringify(history));
    
    return stats;
    
  } catch (error) {
    console.error('Ошибка сбора статистики:', error);
  }
}

// ============================================
// ОТПРАВКА НА CLOUDFLARE WORKER
// ============================================

async function sendStatsToWorker(stats) {
  // ТВОЙ URL WORKER (замени на свой)
  const WORKER_URL = 'https://round-band-482a.portal-rosfin.workers.dev/stats';
  
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stats)
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Статистика отправлена через Worker');
    } else {
      console.error('❌ Ошибка отправки:', result);
      // Сохраняем в fallback при ошибке
      saveToFallback(stats);
    }
  } catch (error) {
    console.error('❌ Ошибка соединения с Worker:', error);
    // Сохраняем в fallback при ошибке
    saveToFallback(stats);
  }
}

// ============================================
// FALLBACK (сохранение при ошибке)
// ============================================

function saveToFallback(stats) {
  try {
    const fallback = JSON.parse(localStorage.getItem('statsFallback') || '[]');
    fallback.push(stats);
    if (fallback.length > 50) fallback.shift();
    localStorage.setItem('statsFallback', JSON.stringify(fallback));
    console.log('💾 Данные сохранены локально (отправятся позже)');
  } catch (e) {
    console.error('❌ Ошибка сохранения fallback:', e);
  }
}

// ============================================
// ОТПРАВКА НЕОТПРАВЛЕННЫХ ДАННЫХ
// ============================================

async function sendPendingStats() {
  try {
    const pending = JSON.parse(localStorage.getItem('statsFallback') || '[]');
    if (pending.length === 0) return;
    
    console.log(`📦 Отправка ${pending.length} отложенных записей...`);
    
    for (const stats of pending) {
      await sendStatsToWorker(stats);
      // Небольшая задержка, чтобы не забанили
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    localStorage.removeItem('statsFallback');
    console.log('✅ Все отложенные данные отправлены');
  } catch (error) {
    console.error('❌ Ошибка отправки отложенных данных:', error);
  }
}

// ============================================
// ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(collectFullStats, 1500);
  // Пытаемся отправить накопившиеся данные
  setTimeout(sendPendingStats, 5000);
});

// Если страница загружена через history API (SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(collectFullStats, 1500);
  }
}).observe(document, { subtree: true, childList: true });

console.log('📊 Статистика посетителей активирована!');