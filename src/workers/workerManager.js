export class WorkerPoolManager {
  constructor(store) {
    this.store = store;
    this.pools = { http: [], compute: [] };
    this.taskQueues = { http: [], compute: [] };
    this.maxWorkersPerType = { http: 0, compute: 0 };
  }

  initPool(type, WorkerClass, workerType, maxWorkers) {
    const pool = this.pools[type];
    const startIndex = pool.length;

    this.maxWorkersPerType[type] = (this.maxWorkersPerType[type] || 0) + maxWorkers;

    for (let i = startIndex; i < startIndex + maxWorkers; i++) {
      const worker = new WorkerClass();
      worker.id = `${workerType}-${i}`;
      console.log(`[Worker(${type}:${workerType}) id ${worker.id}] Created`);

      worker.onmessage = (e) => {
        const workerRef = pool.find(w => w.worker === e.target);
        console.log(`[Worker(${type}:${workerType}) id ${workerRef.id}] Response received:`, e.data);
        this.handleWorkerMessage(type, e);
      };

      worker.onerror = (err) => {
        console.error(`[Worker(${type}:${workerType}) id ${worker.id}] Error:`, err.message);
        this.handleWorkerError(type, err);
      };

      pool.push({ worker, busy: false, id: worker.id, workerType });
    }
  }

  addTask(task) {
    if (task.workerType === 'all') {
      const workerTypes = task.type === 'compute' ? ['js', 'rust'] : ['http'];
      workerTypes.forEach(workerType => {
        this.taskQueues[task.type].push({ ...task, workerType, id: `${task.id}-${workerType}` });
      });
    } else {
      this.taskQueues[task.type].push(task);
    }
    this.processQueue(task.type);
  }

  processQueue(type) {
    const queue = this.taskQueues[type];
    if (queue.length === 0) return;

    const pool = this.pools[type];
    const task = queue[0];
    const freeWorker = pool.find(w => !w.busy && (task.workerType === 'all' || w.workerType === task.workerType));

    if (!freeWorker) return;

    queue.shift();
    freeWorker.busy = true;

    try {
      freeWorker.worker.postMessage({
        id: task.id,
        type: task.type,
        taskName: task.taskName,
        payload: JSON.parse(JSON.stringify(task.payload)),
      });
      console.log(`[Worker manager] Task #${task.id} (type: ${type}, workerType: ${freeWorker.workerType}) sent to worker id ${freeWorker.id}`);
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
    Object.values(this.pools).flat().forEach(w => w.worker.terminate());
    this.pools = { http: [], compute: [] };
    this.taskQueues = { http: [], compute: [] };
    this.maxWorkersPerType = { http: 0, compute: 0 };
  }
}
