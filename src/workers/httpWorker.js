// src/workers/httpWorker.js

let selfType = null;

self.onmessage = async function(e) {
  const message = e.data;

  // Устанавливаем метаданные при первом сообщении
  if (message.id && message.type && message.payload) {
    selfType = message.type;
  }

  console.log(`[Worker(${selfType})] Получено сообщение:`, message);

  const { ip, port, username, password, method = 'GET', body = null } = message.payload;

  try {
    const protocol = ip.startsWith('http') ? '' : 'https://';
    const url = `${protocol}${ip}`;
    console.log(`[Worker(${selfType})] Выполняем запрос:`, url);

    const headers = {
      'Authorization': 'Basic ' + btoa(`${username}:${password}`),
      'Content-Type': 'application/json',
    };

    const options = {
      method,
      headers,
    };

    if (method === 'POST' && body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    // Проверяем, успешен ли ответ
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status} ${response.statusText} для URL ${url}`);
    }

    const data = await response.json();

    self.postMessage({
      status: 'success',
      data,
      meta: { ip, port, type: selfType, id: message.id, method } // Добавляем method в meta
    });

  } catch (error) {
    console.error(`[Worker(${selfType})] Ошибка выполнения:`, error.message);
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { ip, port, type: selfType, id: message.id, method } // Добавляем method в meta
    });
  }
};
