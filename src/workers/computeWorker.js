// src/workers/computeWorker.js
self.onmessage = function(e) {
  const { id, type, payload } = e.data;
  console.log(`[Worker(compute)] Получено сообщение #${id}`);

  try {
    // Пример сложного вычисления — факториал
    const result = factorial(payload.number);

    self.postMessage({
      status: 'success',
      data: result,
      meta: {
        type,
        id
      }
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message
    });
  }
};

function factorial(n) {
  if (n < 0) throw new Error('Факториал отрицательного числа не определён');
  let res = BigInt(1);
  for (let i = 2; i <= n; i++) {
    res *= BigInt(i);
  }
  return res.toString();
}
