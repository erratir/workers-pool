// src/workers/httpWorker.js

let selfType = null;

self.onmessage = async function(e) {
  const message = e.data;

  // Устанавливаем метаданные при первом сообщении
  if (message.id && message.type && message.payload) {
    selfType = message.type;
  }

  console.log(`[Worker(${selfType}) Получено сообщение:`, message);

  const { ip, port, username, password } = message.payload;

  try {
    const protocol = ip.startsWith('http') ? '' : 'https://';
    const url = `${protocol}${ip}`;
    console.log(`[Worker(${selfType}) Выполняем запрос:`, url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    self.postMessage({
      status: 'success',
      data,
      meta: { ip, port, type: selfType, id: message.id }
    });

  } catch (error) {
    console.error(`[Worker(${selfType})] Ошибка выполнения:`, error.message);
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { ip, port, type: selfType, id: message.id  }
    });
  }
};


// self.onmessage = function(e) {
//   console.log('Получено:', e.data);
//
//   setTimeout(() => {
//     self.postMessage({ status: 'success', data: { message: 'Test OK' } });
//   }, 500);
// };
