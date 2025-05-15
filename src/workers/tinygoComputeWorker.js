import './wasm/golang/wasm_exec_tinygo.js'; // Import TinyGo runtime
import { init, factorial, fibonacci } from './wasm/golang/factorial_go_wasm.js';

self.onmessage = async function(e) {
  const { id, type, taskName, payload } = e.data;
  console.log(`[Worker(compute:tinygo)] Received message #${id}`);

  try {
    await init('tinygo');
    console.log(`[Worker(compute:tinygo)] Initialization completed for message #${id}`);
    const startTime = performance.now();
    let result;
    if (taskName === 'factorial') {
      result = await factorial(payload.number);
      console.log(1, result)
    } else if (taskName === 'fibonacci') {
      result = await fibonacci(payload.number);
      console.log(2, result)
    } else {
      throw new Error('Unsupported task type');
    }
    const endTime = performance.now();

    console.log(1111, result)

    self.postMessage({
      status: 'success',
      data: result,
      meta: {
        type,
        id,
        taskName,
        workerType: 'tinygo',
        time: endTime - startTime
      }
    });
  } catch (error) {
    console.error(`[Worker(compute:tinygo)] Error for message #${id}:`, error.message, error.stack);
    self.postMessage({
      status: 'error',
      error: error.message,
      meta: { type, id, taskName, workerType: 'tinygo' }
    });
  }
};
