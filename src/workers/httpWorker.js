// src/workers/httpWorker.js
self.onmessage = async function(e) {
  console.log(`[Worker(${self.type}) id ${self.id}] Получено сообщение:`, e.data);
  const { ip, port, username, password } = e.data.payload;

  try {
    const protocol = ip.startsWith('http') ? '' : 'https://';
    // const url = `${protocol}${ip}:${port}`;
    const url = `${protocol}${ip}`;

    console.log(`[Worker(${self.type}) id ${self.id}] Выполняем запрос:`, url); // ← логируем URL

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
      meta: { ip, port }
    });
  } catch (error) {
    console.error(`[Worker(${self.type}) id ${self.id}] Ошибка выполнения:`, error.message); // ← обязательно!
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { ip, port }
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
