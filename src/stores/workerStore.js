// src/stores/workerStore.js
import { defineStore } from 'pinia';
import { WorkerPoolManager } from 'src/workers/workerManager.js';
import HttpWorker from 'src/workers/httpWorker.js?worker';

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    manager: new WorkerPoolManager(),
    results: [], // ← новое поле для хранения результатов
  }),

  actions: {
    initPools() {
      if (this.manager.pools.http.length > 0) return;
      else {
        this.manager = new WorkerPoolManager(this); // ← передаем store
        this.manager.initPool('http', HttpWorker);
      }

    },

    sendHttpTask(task) {
      const plainTask = { ...task };
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'http',
          payload: plainTask, // ✅ Теперь правильно
        });
      } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
      }
    },

    addResult(result) {
      this.results.push(result); // ← метод для добавления результата
    },

    terminateAllWorkers() {
      this.manager.terminateAll();
    },
  },
});
