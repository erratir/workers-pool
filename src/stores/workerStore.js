// src/stores/workerStore.js
import { defineStore } from 'pinia';
import RequestWorker from 'src/workers/requestWorker.js?worker';

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    results: [],
    workerPool: [],
    taskQueue: [],
    maxWorkers: Math.min(navigator.hardwareConcurrency || 4, 6) // navigator.hardwareConcurrency — показывает доступное число логических ядер.
  }),

  actions: {
    initWorkerPool() {
      if (this.workerPool.length > 0) return; // ✅ Защита от повторной инициализации

      for (let i = 0; i < this.maxWorkers; i++) {
        const worker = new RequestWorker();
        worker.id = i
        console.log(`[Worker ${worker.id}] Создан`);
        // console.log(worker)

        worker.onmessage = (e) => {
          console.log(`[Worker ${worker.id}] Ответ получен:  ${e.data}`);
          this.handleWorkerMessage(e);
        };

        worker.onerror = (err) => {
          console.error(`[Worker ${worker.id}] Ошибка:', ${err.message}`);
          this.handleWorkerError(err);
        };

        this.workerPool.push({ worker, busy: false });
      }
    },

    sendTask(task) {
      try {
        // Создаем plain object, чтобы избежать проблем с postMessage
        // const plainTask = structuredClone(task);
        // const plainTask = { ...task };

        this.taskQueue.push(task);
        this.processQueue();
      } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
      }
    },

    processQueue() {
      if (this.taskQueue.length === 0) return;

      const freeWorker = this.workerPool.find(w => !w.busy);
      if (!freeWorker) return;

      const task = this.taskQueue.shift();

      console.log('typeof task:', typeof task); // → object
      console.log('Task contents:', task);      // → должен быть plain object
      console.log('Has functions?', Object.values(task).some(v => typeof v === 'function'));
      console.log('Has symbols?', Object.keys(task).some(k => typeof k === 'symbol'));

      const plainTask = { ...task };

      try {
        console.log('Отправляем во воркер:', plainTask);
        freeWorker.worker.postMessage(plainTask);
        freeWorker.busy = true;
      } catch (error) {
        console.error('Ошибка при postMessage:', error);
      }
    },

    handleWorkerMessage(event) {
      const worker = event.target;
      const result = event.data;

      this.results.push(result);

      const poolWorker = this.workerPool.find(w => w.worker === worker);
      if (poolWorker) poolWorker.busy = false;

      this.processQueue();
    },

    handleWorkerError(error) {
      console.error('Worker error:', error.message);
      this.results.push({ status: 'error', error: error.message });

      const poolWorker = this.workerPool.find(w => w.worker === error.target);
      if (poolWorker) poolWorker.busy = false;

      this.processQueue();
    },

    terminateAllWorkers() {
      this.workerPool.forEach(({ worker }) => worker.terminate());
      this.workerPool = [];
      this.taskQueue = [];
    },
  },
});
