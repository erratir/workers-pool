// src/stores/workerStore.js
import { acceptHMRUpdate, defineStore } from 'pinia'
import { WorkerPoolManager } from 'src/workers/workerManager.js';
import HttpWorker from 'src/workers/httpWorker.js?worker';
import ComputeWorker from 'src/workers/computeWorker.js?worker';

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    manager: new WorkerPoolManager(),
    results: [], // поле для хранения результатов
  }),

  actions: {
    initPools() {
      if (this.manager.pools.http.length === 0 && this.manager.pools.compute.length === 0) {
        this.manager = new WorkerPoolManager(this); // ← передаем store
        this.manager.initPool('http', HttpWorker);
        this.manager.initPool('compute', ComputeWorker)
      }
    },

    sendComputeTask(number) {
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'compute',
          payload:  { number }, // ✅ Теперь правильно
        });
      } catch (error) {
        console.error('Ошибка при добавлении задачи:', error);
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

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkerStore, import.meta.hot))
}
