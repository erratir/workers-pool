// src/workers/workerManager.js — базовый класс управления воркерами

export class WorkerPoolManager {
  constructor(store) {
    this.store = store;
    this.pools = { http: [], data: [], compute: [] };
    this.taskQueues = { http: [], data: [], compute: [] };
    this.maxWorkersPerType = { http: 3, data: 2, compute: 2 };
    // navigator.hardwareConcurrency — показывает доступное число логических ядер.  Можно что-то типа ... Math.min(navigator.hardwareConcurrency || 3, 6)
  }

  initPool(type, WorkerClass) {
    const pool = this.pools[type];
    for (let i = 0; i < this.maxWorkersPerType[type]; i++) {
      const worker = new WorkerClass();
      worker.id = i;
      console.log(`[Worker(${type}) id ${worker.id}] Создан`);

      worker.onmessage = (e) => {
        const workerRef = pool.find(w => w.worker === e.target);
        console.log(`[Worker(${type}) id ${workerRef.id}] Ответ получен:`, e.data);
        this.handleWorkerMessage(type, e);
      };

      worker.onerror = (err) => {
        console.error(`[Worker(${type}) id ${worker.id}] Ошибка:`, err.message);
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
      // Передаем не только payload, но и метаданные
      freeWorker.worker.postMessage({
        id: task.id,
        type: task.type,
        payload: JSON.parse(JSON.stringify(task.payload)) // безопасная передача
      });

      console.log(`[Worker manager] Отправлена задача #${task.id} (тип задачи: ${type}) воркеру с id ${freeWorker.worker.id}`);
    } catch (error) {
      console.error('Ошибка при сериализации данных:', error);
    }
  }

  handleWorkerMessage(type, event) {
    const workerRef = this.pools[type].find(w => w.worker === event.target);
    if (workerRef) workerRef.busy = false;

    const result = event.data;
    console.log(`[Worker manager] Получен ответ от ${type}:`, result);

    this.store.addResult(result);
    this.processQueue(type);
  }

  handleWorkerError(type, error) {
    console.error(`[Worker manager] Ошибка воркера ${type}:`, error.message);
  }

  terminateAll() {
    Object.values(this.pools).flat().forEach(w => w.terminate());
    this.pools = { http: [], data: [] };
    this.taskQueues = { http: [], data: [] };
  }
}
