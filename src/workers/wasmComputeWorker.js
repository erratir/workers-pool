import init, { factorial } from './wasm/factorial_wasm.js';

self.onmessage = async function(e) {
  const { id, type, payload } = e.data;
  console.log(`[Worker(wasmCompute)] Received message #${id}`);

  try {
    // Initialize the WASM module
    await init();

    // Measure execution time
    const startTime = performance.now();
    const result = factorial(payload.number);
    const endTime = performance.now();

    self.postMessage({
      status: 'success',
      data: result,
      meta: {
        type,
        id,
        time: endTime - startTime // Include execution time for comparison
      }
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { type, id }
    });
  }
};
