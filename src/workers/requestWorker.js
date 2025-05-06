// src/workers/requestWorker.js
self.onmessage = async function(e) {
  const { ip, port, username, password } = e.data;

  try {
    const protocol = ip.startsWith('http') ? '' : 'https://';
    // const url = `${protocol}${ip}:${port}`;
    const url = `${protocol}${ip}`;

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
