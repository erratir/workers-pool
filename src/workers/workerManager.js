// src/workers/workerManager.js — базовый класс управления воркерами

export class WorkerPoolManager {
  constructor(store) {
    this.store = store;
    this.pools = { http: [], data: [], compute: [], wasmCompute: [] };
    this.taskQueues = { http: [], data: [], compute: [], wasmCompute: [] };
    this.maxWorkersPerType = { http: 3, data: 2, compute: 2, wasmCompute: 2 };
  }

  initPool(type, WorkerClass) {
    const pool = this.pools[type];
    for (let i = 0; i < this.maxWorkersPerType[type]; i++) {
      const worker = new WorkerClass();
      worker.id = i;
      console.log(`[Worker(${type}) id ${worker.id}] Created`);

      worker.onmessage = (e) => {
        const workerRef = pool.find(w => w.worker === e.target);
        console.log(`[Worker(${type}) id ${workerRef.id}] Response received:`, e.data);
        this.handleWorkerMessage(type, e);
      };

      worker.onerror = (err) => {
        console.error(`[Worker(${type}) id ${worker.id}] Error:`, err.message);
        this.handleWorkerError(type, err);
      };

      pool.push({ worker, busy: false, id: worker.id });
    }
  }

  addTask(task) {
    this.taskQueues[task.type].push(task);
    this.processQueue(task.type);
  }

  processQueue(type) {
    const queue = this.taskQueues[type];
    if (queue.length === 0) return;

    const pool = this.pools[type];
    const freeWorker = pool.find(w => !w.busy);
    if (!freeWorker) return;

    const task = queue.shift();
    freeWorker.busy = true;

    try {
      freeWorker.worker.postMessage({
        id: task.id,
        type: task.type,
        payload: JSON.parse(JSON.stringify(task.payload))
      });
      console.log(`[Worker manager] Task #${task.id} (type: ${type}) sent to worker id ${freeWorker.worker.id}`);
    } catch (error) {
      console.error('Error serializing data:', error);
    }
  }

  handleWorkerMessage(type, event) {
    const workerRef = this.pools[type].find(w => w.worker === event.target);
    if (workerRef) workerRef.busy = false;

    const result = event.data;
    console.log(`[Worker manager] Response from ${type}:`, result);

    this.store.addResult(result);
    this.processQueue(type);
  }

  handleWorkerError(type, error) {
    console.error(`[Worker manager] Worker ${type} error:`, error.message);
  }

  terminateAll() {
    Object.values(this.pools).flat().forEach(w => w.terminate());
    this.pools = { http: [], data: [], compute: [], wasmCompute: [] };
    this.taskQueues = { http: [], data: [], compute: [], wasmCompute: [] };
  }
}
