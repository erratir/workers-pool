self.onmessage = function(e) {
  const { id, type, taskName, payload } = e.data;
  console.log(`[Worker(compute:js)] Получено сообщение #${id}`);

  try {
    const startTime = performance.now();
    const result = factorial(payload.number);
    const endTime = performance.now();

    self.postMessage({
      status: 'success',
      data: result,
      meta: {
        type,
        id,
        taskName,
        workerType: 'js',
        time: endTime - startTime
      }
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { type, id, taskName, workerType: 'js' }
    });
  }
};

function factorial(n) {
  if (n < 0) throw new Error('Factorial of negative number is undefined');
  let res = BigInt(1);
  for (let i = 2; i <= n; i++) {
    res *= BigInt(i);
  }
  return res.toString();
}
