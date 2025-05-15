import { acceptHMRUpdate, defineStore } from 'pinia';
import { WorkerPoolManager } from 'src/workers/workerManager.js';
import HttpWorker from 'src/workers/httpWorker.js?worker';
import ComputeWorker from 'src/workers/jsComputeWorker.js?worker';
import RustComputeWorker from 'src/workers/rustComputeWorker.js?worker';
import GoComputeWorker from 'src/workers/goComputeWorker.js?worker';
import TinyGoComputeWorker from 'src/workers/tinygoComputeWorker.js?worker';

const workerConfig = [
  { type: 'http', workerClass: HttpWorker, workerType: 'http', maxWorkers: 3 },
  { type: 'compute', workerClass: ComputeWorker, workerType: 'js', maxWorkers: 2 },
  { type: 'compute', workerClass: RustComputeWorker, workerType: 'rust', maxWorkers: 2 },
  { type: 'compute', workerClass: GoComputeWorker, workerType: 'go', maxWorkers: 2 },
  { type: 'compute', workerClass: TinyGoComputeWorker, workerType: 'tinygo', maxWorkers: 2 },
];

export const useWorkerStore = defineStore('worker', {
  state: () => ({
    manager: new WorkerPoolManager(),
    httpResults: [],
    computeResults: [],
    workerConfig,
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
        jsCount: this.manager.pools.compute.filter(w => w.workerType === 'js').length,
        rustCount: this.manager.pools.compute.filter(w => w.workerType === 'rust').length,
        goCount: this.manager.pools.compute.filter(w => w.workerType === 'go').length,
        tinygoCount: this.manager.pools.compute.filter(w => w.workerType === 'tinygo').length,
      };
    },
    computeMetrics() {
      const metrics = {
        js: { factorial: { avgTime: 0, count: 0 }, fibonacci: { avgTime: 0, count: 0 } },
        rust: { factorial: { avgTime: 0, count: 0 }, fibonacci: { avgTime: 0, count: 0 } },
        go: { factorial: { avgTime: 0, count: 0 }, fibonacci: { avgTime: 0, count: 0 } },
        tinygo: { factorial: { avgTime: 0, count: 0 }, fibonacci: { avgTime: 0, count: 0 } },
      };
      this.computeResults.forEach(result => {
        if (result.status === 'success') {
          const { workerType, taskName } = result.meta;
          metrics[workerType][taskName].avgTime =
            (metrics[workerType][taskName].avgTime * metrics[workerType][taskName].count + result.meta.time) /
            (metrics[workerType][taskName].count + 1);
          metrics[workerType][taskName].count += 1;
        }
      });
      return metrics;
    },
    httpMetrics() {
      const metrics = { avgTime: 0, count: 0 };
      this.httpResults.forEach(result => {
        if (result.status === 'success' && result.meta.time) {
          metrics.avgTime = (metrics.avgTime * metrics.count + result.meta.time) / (metrics.count + 1);
          metrics.count += 1;
        }
      });
      return metrics;
    },
  },

  actions: {
    initPools() {
      if (this.manager.pools.http.length === 0 && this.manager.pools.compute.length === 0) {
        this.manager = new WorkerPoolManager(this);
        this.workerConfig.forEach(({ type, workerClass, workerType, maxWorkers }) => {
          this.manager.initPool(type, workerClass, workerType, maxWorkers);
        });
      }
    },

    sendComputeTask(number, workerType, taskName) {
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'compute',
          workerType: workerType,
          taskName: taskName,
          payload: { number },
        });
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },

    sendHttpTask(task, workerType, taskName) {
      const plainTask = { ...task };
      try {
        this.manager.addTask({
          id: Date.now().toString(),
          type: 'http',
          workerType: workerType,
          taskName: taskName,
          payload: plainTask,
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
      }
    },

    clearResults(type) {
      if (type === 'http') {
        this.httpResults = [];
      } else if (type === 'compute') {
        this.computeResults = [];
      }
    },

    updateWorkerConfig(config) {
      // Validate worker counts
      const validatedConfig = {
        http: Math.max(1, config.http),
        js: Math.max(1, config.js),
        rust: Math.max(1, config.rust),
        go: Math.max(1, config.go),
        tinygo: Math.max(1, config.tinygo),
      };

      // Warn if worker counts are excessive
      const maxRecommendedWorkers = 10;
      Object.entries(validatedConfig).forEach(([type, count]) => {
        if (count > maxRecommendedWorkers) {
          console.warn(
            `[WorkerStore] Warning: Setting ${count} workers for ${type} may impact browser performance. Consider reducing the number.`
          );
        }
      });

      this.manager.terminateAll();
      this.workerConfig = [
        { type: 'http', workerClass: HttpWorker, workerType: 'http', maxWorkers: validatedConfig.http },
        { type: 'compute', workerClass: ComputeWorker, workerType: 'js', maxWorkers: validatedConfig.js },
        { type: 'compute', workerClass: RustComputeWorker, workerType: 'rust', maxWorkers: validatedConfig.rust },
        { type: 'compute', workerClass: GoComputeWorker, workerType: 'go', maxWorkers: validatedConfig.go },
        { type: 'compute', workerClass: TinyGoComputeWorker, workerType: 'tinygo', maxWorkers: validatedConfig.tinygo },
      ];
      this.manager = new WorkerPoolManager(this);
      this.initPools();
    },

    terminateAllWorkers() {
      this.manager.terminateAll();
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useWorkerStore, import.meta.hot));
}
