import './wasm/golang/wasm_exec_go.js'; // Import Go runtime
import { init, factorial, fibonacci } from './wasm/golang/factorial_go_wasm.js';

self.onmessage = async function(e) {
  const { id, type, taskName, payload } = e.data;
  console.log(`[Worker(compute:go)] Received message #${id}`);

  try {
    await init('go');
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
        workerType: 'go',
        time: endTime - startTime
      }
    });
  } catch (error) {
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { type, id, taskName, workerType: 'go' }
    });
  }
};
