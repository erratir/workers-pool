self.onmessage = function(e) {
  const { id, type, taskName, payload } = e.data;
  console.log(`[Worker(compute:js)] Получено сообщение #${id}`);

  try {
    const startTime = performance.now();
    let result;
    if (taskName === 'factorial') {
      result = factorial(payload.number);
    } else if (taskName === 'fibonacci') {
      result = fibonacci(payload.number);
    } else {
      throw new Error('Unsupported task type');
    }
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

function fibonacci(n) {
  if (n < 0) throw new Error('Fibonacci of negative number is undefined');
  let a = BigInt(0), b = BigInt(1);
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a.toString();
}
