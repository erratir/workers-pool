let wasmInstance;

export async function init(compiler = 'go') {
  if (wasmInstance) return;
  const wasmFile = `factorial_${compiler}_wasm.wasm`

  const go = new Go();
  try {
    const module = await fetch(new URL(wasmFile, import.meta.url));
    const result = await WebAssembly.instantiateStreaming(module, go.importObject);
    go.run(result.instance);
    wasmInstance = result.instance;
    console.log(`WASM module (${wasmFile}) initialized successfully`);
  } catch (error) {
    console.error(`Failed to initialize WASM module (${wasmFile}):`, error);
    throw error;
  }
}

export function factorial(n) {
  if (!globalThis.factorial) {
    throw new Error('factorial function not available');
  }
  return globalThis.factorial(n);
}

export function fibonacci(n) {
  if (!globalThis.fibonacci) {
    throw new Error('fibonacci function not available');
  }
  return globalThis.fibonacci(n);
}
