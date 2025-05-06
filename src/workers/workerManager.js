// src/workers/workerManager.js — базовый класс управления воркерами

export class WorkerPoolManager {
  constructor(store) {
    this.store = store; // ← принимаем store
    this.pools = { http: [], data: [] };
    this.taskQueues = { http: [], data: [] };
    this.maxWorkersPerType = { http: 3, data: 2 };
  }

  initPool(type, WorkerClass) {
    const pool = this.pools[type];
    for (let i = 0; i < this.maxWorkersPerType[type]; i++) {
      const worker = new WorkerClass();
      worker.id = i;
      console.log(`[Worker(${type}) id ${worker.id}] Создан`);

      worker.onmessage = (e) => {
        console.log(`[Worker(${type}) id ${worker.id}] Ответ получен:`, e.data);
        this.handleWorkerMessage(type, e);
      };

      worker.onerror = (err) => {
        console.error(`[Worker(${type}) id ${worker.id}] Ошибка:`, err.message);
        this.handleWorkerError(type, err);
      };

      pool.push({ worker, busy: false }); // ✅ Храним вместе со статусом
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
      // Гарантируем передачу plain object
      const payload = JSON.parse(JSON.stringify(task.payload));
      freeWorker.worker.postMessage({ ...task, payload });
      console.log(`[Worker manager] Отправлена задача #${task.id} (тип задачи: ${type}) воркеру с id ${freeWorker.worker.id}`);
    } catch (error) {
      console.error('Ошибка при сериализация данных:', error);
    }
  }

  handleWorkerMessage(type, event) {
    const workerRef = this.pools[type].find(w => w.worker === event.target);
    if (workerRef) workerRef.busy = false;

    const result = event.data;
    console.log(`[Worker manager] Получен ответ от ${type}:`, result);

    this.store.addResult(result); // ← обновляем store
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
