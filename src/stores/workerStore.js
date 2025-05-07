// src/stores/workerStore.js
import { acceptHMRUpdate, defineStore } from 'pinia';
import { WorkerPoolManager } from 'src/workers/workerManager.js';
import HttpWorker from 'src/workers/httpWorker.js?worker';
import ComputeWorker from 'src/workers/computeWorker.js?worker';
import WasmComputeWorker from 'src/workers/wasmComputeWorker.js?worker';

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    manager: new WorkerPoolManager(),
    httpResults: [],
    computeResults: [],
    wasmComputeResults: [],
  }),

  getters: {
    httpWorkerStats() {
      return {
        total: this.manager.pools.http.length,
        busy: this.manager.pools.http.filter(w => w.busy).length,
        free: this.manager.pools.http.length - this.manager.pools.http.filter(w => w.busy).length,
        activeTasks: this.manager.taskQueues.http.length,
      };
    },
    computeWorkerStats() {
      return {
        total: this.manager.pools.compute.length,
        busy: this.manager.pools.compute.filter(w => w.busy).length,
        free: this.manager.pools.compute.length - this.manager.pools.compute.filter(w => w.busy).length,
        activeTasks: this.manager.taskQueues.compute.length,
      };
    },
    wasmComputeWorkerStats() {
      return {
        total: this.manager.pools.wasmCompute.length,
        busy: this.manager.pools.wasmCompute.filter(w => w.busy).length,
        free: this.manager.pools.wasmCompute.length - this.manager.pools.wasmCompute.filter(w => w.busy).length,
        activeTasks: this.manager.taskQueues.wasmCompute.length,
      };
    },
  },

  actions: {
    initPools() {
      if (this.manager.pools.http.length === 0 && this.manager.pools.compute.length === 0) {
        this.manager = new WorkerPoolManager(this);
        this.manager.initPool('http', HttpWorker);
        this.manager.initPool('compute', ComputeWorker);
        this.manager.initPool('wasmCompute', WasmComputeWorker);
      }
    },

    sendComputeTask(number) {
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'compute',
          payload: { number },
        });
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },

    sendHttpTask(task) {
      const plainTask = { ...task };
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'http',
          payload: plainTask,
        });
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },

    sendWasmComputeTask(number) {
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'wasmCompute',
          payload: { number },
        });
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },

    addResult(result) {
      if (result.meta.type === 'http') {
        this.httpResults.push(result);
      } else if (result.meta.type === 'compute') {
        this.computeResults.push(result);
      } else if (result.meta.type === 'wasmCompute') {
        this.wasmComputeResults.push(result);
      }
    },

    clearResults(type) {
      if (type === 'http') {
        this.httpResults = [];
      } else if (type === 'compute') {
        this.computeResults = [];
      } else if (type === 'wasmCompute') {
        this.wasmComputeResults = [];
      }
    },

    terminateAllWorkers() {
      this.manager.terminateAll();
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkerStore, import.meta.hot));
}
