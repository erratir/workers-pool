import init, { factorial } from './wasm/factorial_wasm.js';

self.onmessage = async function(e) {
  const { id, type, taskName, payload } = e.data;
  console.log(`[Worker(compute:rust)] Received message #${id}`);

  try {
    await init();
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
        workerType: 'rust',
        time: endTime - startTime
      }
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { type, id, taskName, workerType: 'rust' }
    });
  }
};
