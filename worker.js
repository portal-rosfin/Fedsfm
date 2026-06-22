export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // === ТОКЕН БОТА ===
    const BOT_TOKEN = "8707831948:AAEXFJ9ViR4D9thWCDsbK-ImsVvzeKegcXA";
    const CHAT_ID = "7386406575";

    try {
      const url = new URL(request.url);
      const action = url.pathname.replace('/', '');

      // === ПОЛУЧАЕМ ДАННЫЕ О ПОСЕТИТЕЛЕ ===
      const ip = request.headers.get('CF-Connecting-IP') || 
                 request.headers.get('X-Forwarded-For')?.split(',')[0] || 
                 request.headers.get('Remote-Addr') || 
                 'unknown';

      const country = request.headers.get('CF-IPCountry') || 'unknown';
      const city = request.headers.get('CF-IPCity') || 'unknown';
      const region = request.headers.get('CF-Region') || 'unknown';

      const userAgent = request.headers.get('User-Agent') || 'unknown';
      const referer = request.headers.get('Referer') || 'Прямой переход';

      // === ПАРСИМ УСТРОЙСТВО ===
      function parseUserAgent(ua) {
        let device = 'unknown';
        let browser = 'unknown';
        let os = 'unknown';

        if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
        else if (ua.includes('Windows NT 6.3')) os = 'Windows 8.1';
        else if (ua.includes('Windows NT 6.2')) os = 'Windows 8';
        else if (ua.includes('Windows NT 6.1')) os = 'Windows 7';
        else if (ua.includes('Mac OS X')) os = 'macOS';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Chrome OS')) os = 'Chrome OS';

        if (ua.includes('Firefox/')) browser = 'Firefox';
        else if (ua.includes('Edg/')) browser = 'Edge';
        else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
        else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
        else if (ua.includes('Opera/') || ua.includes('OPR/')) browser = 'Opera';
        else if (ua.includes('YaBrowser/')) browser = 'Yandex Browser';
        else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'Internet Explorer';

        if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPad')) {
          device = '📱 Мобильное устройство';
        } else if (ua.includes('Tablet')) {
          device = '📱 Планшет';
        } else {
          device = '💻 Компьютер';
        }

        return { device, browser, os };
      }

      const parsedUA = parseUserAgent(userAgent);

      // === ПРОВЕРЯЕМ, ЧТО ПРИШЛО В ТЕЛЕ ЗАПРОСА ===
      let page = url.pathname || '/';
      let referrerPage = referer;

      try {
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          const requestBody = await request.clone().json();
          if (requestBody.page) page = requestBody.page;
          if (requestBody.referrer) referrerPage = requestBody.referrer;
        }
      } catch (e) {
        // Если не JSON — игнорируем
      }

      // === ФОРМИРУЕМ ОТЧЁТ ===
      const date = new Date();
      let message = `🕵️‍♂️ НОВЫЙ ПОСЕТИТЕЛЬ\n`;
      message += `═══════════════════════\n`;
      message += `🌐 IP: ${ip}\n`;
      message += `📍 Страна: ${country}\n`;
      message += `🏙️ Город: ${city || 'неизвестен'}\n`;
      message += `⏰ Время: ${date.toLocaleString('ru-RU')}\n`;
      message += `═══════════════════════\n`;
      message += `${parsedUA.device} ${parsedUA.os}\n`;
      message += `🖥️ ${parsedUA.browser}\n`;
      message += `═══════════════════════\n`;
      message += `📄 Страница: ${page}\n`;
      message += `🔗 Откуда: ${referrerPage}\n`;
      message += `🤖 UA: ${userAgent.substring(0, 60)}...`;

      // === ОТПРАВКА В TELEGRAM ===
      let tgResult = null;
      try {
        const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const tgResponse = await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
          })
        });
        tgResult = await tgResponse.json();
        console.log('📨 Ответ Telegram:', tgResult);
      } catch (tgError) {
        console.error('❌ Ошибка отправки в Telegram:', tgError);
      }

      // === ЕСЛИ ЭТО ЗАПРОС НА ОТПРАВКУ ФОРМЫ ===
      if (action === 'sendMessage' || action === 'sendDocument' || action === 'sendPhoto') {
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/${action}`;
        const contentType = request.headers.get('Content-Type') || '';
        let response;

        if (contentType.includes('application/json')) {
          const jsonBody = await request.text();
          response = await fetch(telegramUrl, {
            method: 'POST',
            body: jsonBody,
            headers: { 'User-Agent': 'Cloudflare Worker', 'Content-Type': 'application/json' }
          });
        } else if (contentType.includes('multipart/form-data')) {
          const incomingFormData = await request.formData();
          const telegramFormData = new FormData();

          for (const [key, value] of incomingFormData.entries()) {
            const isFile = value && typeof value === 'object' && (value instanceof Blob || value instanceof File);
            if (isFile) {
              telegramFormData.append(key, value, value.name || 'file');
            } else {
              telegramFormData.append(key, String(value));
            }
          }

          response = await fetch(telegramUrl, {
            method: 'POST',
            body: telegramFormData,
            headers: { 'User-Agent': 'Cloudflare Worker' }
          });
        } else {
          return new Response(JSON.stringify({ ok: false, error: 'Unsupported Content-Type' }), { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // === ВОЗВРАЩАЕМ ОТВЕТ ===
      return new Response(JSON.stringify({ 
        ok: true, 
        message: 'Отчёт отправлен в Telegram',
        telegram: tgResult
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });

    } catch (error) {
      console.error('❌ Ошибка:', error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  }
};