<!-- src/pages/IndexPage.vue -->
<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md">
      <q-btn label="Настройки воркеров" @click="showSettings = true" color="grey" />
    </div>
    <div class="row">
      <div class="col-1">
        <q-tabs v-model="activeTab" vertical dense class="text-teal" indicator-color="teal">
          <q-tab name="http" label="HTTP" />
          <q-tab name="compute" label="Compute" />
          <q-tab name="dashboard" label="Dashboard" />
        </q-tabs>
      </div>
      <div class="col-11">
        <q-tab-panels v-model="activeTab" animated>
          <!-- HTTP Tab -->
          <q-tab-panel name="http">
            <q-card class="card-style">
              <q-card-section class="row items-center q-pa-none">
                <div class="text-h6">HTTP-воркер</div>
                <q-icon name="info" color="primary" size="sm" class="q-ml-sm cursor-pointer" @click="showHttpDetails = true" />
              </q-card-section>
              <q-card-section>
                <div class="row q-gutter-lg">
                  <q-select v-model="httpMethod" :options="['GET', 'POST']" label="Метод" dense class="col-1" />
                  <q-input v-model="ip" label="IP или URL" class="col-7" />
                  <q-input v-model.number="port" label="Порт" type="number" class="col-2" />
                  <q-select v-model="httpWorkerType" :options="['http', 'all']" label="Тип воркера" dense class="col-2" />
                </div>
                <div class="row q-gutter-lg">
                  <q-input v-model="username" label="Имя пользователя" class="col-5" />
                  <q-input v-model="password" label="Пароль" type="password" class="col-5" />
                </div>
                <div v-if="httpMethod === 'POST'" class="row">
                  <q-input v-model="postBody" label="Тело POST (JSON)" type="textarea" class="col-12" />
                </div>
              </q-card-section>
              <q-card-section>
                <q-btn label="Отправить запрос" @click="sendRequest" color="primary" :loading="loading" />
                <div class="stats">
                  Задачи в очереди: {{ workerStore.httpWorkerStats.activeTasks }} / Всего воркеров: {{ workerStore.httpWorkerStats.total }} / Свободно: {{ workerStore.httpWorkerStats.free }}
                </div>
              </q-card-section>
            </q-card>
            <div class="results-header">
              <h5>Результаты HTTP-запросов:</h5>
              <div>
                <q-select v-model="httpFilter" :options="['all', 'http']" label="Фильтр по воркеру" dense style="width: 150px" />
                <q-btn v-if="httpResults.length" label="Очистить" color="negative" size="sm" @click="workerStore.clearResults('http')" />
              </div>
            </div>
            <div class="result-scrollable">
              <div v-if="httpResults.length" class="result-list">
                <div v-for="(result, i) in httpResults" :key="i" class="result-item">
                  <q-card bordered class="result-card" :class="{ 'error-card': result.status === 'error' }">
                    <q-card-section>
                      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div v-else class="no-results">Нет выполненных HTTP-запросов.</div>
            </div>
          </q-tab-panel>

          <!-- Compute Tab -->
          <q-tab-panel name="compute">
            <q-card class="card-style">
              <q-card-section class="row items-center q-pa-none">
                <div class="text-h6">Compute-воркер</div>
                <q-icon name="info" color="secondary" size="sm" class="q-ml-sm cursor-pointer" @click="showComputeDetails = true" />
              </q-card-section>
              <q-card-section>
                <div class="row q-gutter-md">
                  <q-input v-model.number="number" label="Введите число" class="col-6" />
                  <q-select v-model="computeTaskType" :options="['factorial', 'fibonacci']" label="Тип задачи" dense class="col-3" />
                  <q-select v-model="computeWorkerType" :options="['js', 'rust', 'go', 'tinygo', 'all']" label="Тип воркера" dense class="col-3" />
                </div>
              </q-card-section>
              <q-card-section>
                <q-btn label="Выполнить вычисление" @click="runCompute" color="secondary" :loading="loading" />
                <div class="stats">
                  Задачи в очереди: {{ workerStore.computeWorkerStats.activeTasks }} / Всего воркеров: {{ workerStore.computeWorkerStats.total }} / Свободно: {{ workerStore.computeWorkerStats.free }}
                </div>
              </q-card-section>
            </q-card>
            <div class="results-header">
              <h5>Результаты вычислений:</h5>
              <div>
                <q-select v-model="computeFilter" :options="['all', 'js', 'rust', 'go', 'tinygo']" label="Фильтр по воркеру" dense style="width: 150px" />
                <q-btn v-if="computeResults.length" label="Очистить" color="negative" size="sm" @click="workerStore.clearResults('compute')" />
              </div>
            </div>
            <div class="result-scrollable">
              <div v-if="computeResults.length" class="result-list">
                <div v-for="(result, i) in computeResults" :key="i" class="result-item">
                  <q-card bordered class="result-card" :class="{ 'error-card': result.status === 'error' }">
                    <q-card-section>
                      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
              <div v-else class="no-results">Нет выполненных вычислений.</div>
            </div>
          </q-tab-panel>

          <!-- Dashboard Tab -->
          <q-tab-panel name="dashboard">
            <q-card class="card-style">
              <q-card-section>
                <div class="text-h6">Метрики производительности</div>
              </q-card-section>
              <q-card-section>
                <p>Среднее время выполнения (факториал):</p>
                <p>JS: {{ workerStore.computeMetrics.js.factorial.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.js.factorial.count }} задач)</p>
                <p>Rust: {{ workerStore.computeMetrics.rust.factorial.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.rust.factorial.count }} задач)</p>
                <p>Go: {{ workerStore.computeMetrics.go.factorial.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.go.factorial.count }} задач)</p>
                <p>TinyGo: {{ workerStore.computeMetrics.tinygo.factorial.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.tinygo.factorial.count }} задач)</p>
              </q-card-section>
              <q-card-section>
                <p>Среднее время выполнения (фибоначи):</p>
                <p>JS: {{ workerStore.computeMetrics.js.fibonacci.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.js.fibonacci.count }} задач)</p>
                <p>Rust: {{ workerStore.computeMetrics.rust.fibonacci.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.rust.fibonacci.count }} задач)</p>
                <p>Go: {{ workerStore.computeMetrics.go.fibonacci.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.go.fibonacci.count }} задач)</p>
                <p>TinyGo: {{ workerStore.computeMetrics.tinygo.fibonacci.avgTime.toFixed(2) }} мс ({{ workerStore.computeMetrics.tinygo.fibonacci.count }} задач)</p>
              </q-card-section>
              <q-card-section>
                <p>Среднее время HTTP-запросов: {{ workerStore.httpMetrics.avgTime.toFixed(2) }} мс ({{ workerStore.httpMetrics.count }} задач)</p>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="showHttpDetails">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Подробности HTTP-воркера</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>Всего воркеров: {{ workerStore.httpWorkerStats.total }}</p>
          <p>Свободных воркеров: {{ workerStore.httpWorkerStats.free }}</p>
          <p>Занятых воркеров: {{ workerStore.httpWorkerStats.busy }}</p>
          <p>Задачи в очереди: {{ workerStore.httpWorkerStats.activeTasks }}</p>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showComputeDetails">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Подробности Compute-воркера</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>Всего воркеров: {{ workerStore.computeWorkerStats.total }}</p>
          <p>Воркеров JS: {{ workerStore.computeWorkerStats.jsCount }}</p>
          <p>Воркеров Rust: {{ workerStore.computeWorkerStats.rustCount }}</p>
          <p>Воркеров Go: {{ workerStore.computeWorkerStats.goCount }}</p>
          <p>Воркеров TinyGo: {{ workerStore.computeWorkerStats.tinygoCount }}</p>
          <p>Свободных воркеров: {{ workerStore.computeWorkerStats.free }}</p>
          <p>Занятых воркеров: {{ workerStore.computeWorkerStats.busy }}</p>
          <p>Задачи в очереди: {{ workerStore.computeWorkerStats.activeTasks }}</p>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSettings">
      <q-card>
        <q-card-section>
          <div class="text-h6">Настройки воркеров</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model.number="workerConfig.http" label="HTTP воркеры" type="number" min="1" />
          <q-input v-model.number="workerConfig.js" label="JS Compute воркеры" type="number" min="1" />
          <q-input v-model.number="workerConfig.rust" label="Rust Compute воркеры" type="number" min="1" />
          <q-input v-model.number="workerConfig.go" label="Go Compute воркеры" type="number" min="1" />
          <q-input v-model.number="workerConfig.tinygo" label="TinyGo Compute воркеры" type="number" min="1" />
        </q-card-section>
        <q-card-actions>
          <q-btn label="Сохранить" @click="saveWorkerConfig" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useWorkerStore } from 'src/stores/workerStore';

const $q = useQuasar();
const workerStore = useWorkerStore();
const loading = ref(false);
const number = ref(123456);
const ip = ref('jsonplaceholder.typicode.com/todos/1');
const port = ref(443);
const username = ref('admin');
const password = ref('admin111');
const activeTab = ref('http');
const showHttpDetails = ref(false);
const showComputeDetails = ref(false);
const showSettings = ref(false);
const httpMethod = ref('GET');
const postBody = ref('');
const computeWorkerType = ref('js');
const httpWorkerType = ref('http');
const computeTaskType = ref('factorial');
const computeFilter = ref('all');
const httpFilter = ref('all');
const workerConfig = ref({ http: 3, js: 2, rust: 2, go: 2, tinygo: 2 });

const httpResults = computed(() => {
  let results = workerStore.httpResults;
  if (httpFilter.value !== 'all') {
    results = results.filter(result => result.meta.workerType === httpFilter.value);
  }
  return results.sort((a, b) => b.meta.time - a.meta.time);
});

const computeResults = computed(() => {
  let results = workerStore.computeResults;
  if (computeFilter.value !== 'all') {
    results = results.filter(result => result.meta.workerType === computeFilter.value);
  }
  return results.sort((a, b) => b.meta.time - a.meta.time);
});

function runCompute() {
  loading.value = true;
  workerStore.sendComputeTask(number.value, computeWorkerType.value, computeTaskType.value);
  loading.value = false;
  activeTab.value = 'compute';
}

async function sendRequest() {
  if (!ip.value || !port.value || !username.value || !password.value) {
    $q.notify({
      type: 'negative',
      message: 'Пожалуйста, заполните все поля для HTTP-запроса.',
    });
    return;
  }

  loading.value = true;
  const task = {
    ip: ip.value,
    port: port.value,
    username: username.value,
    password: password.value,
    method: httpMethod.value,
    body: httpMethod.value === 'POST' ? (postBody.value ? JSON.parse(postBody.value) : null) : null,
  };
  try {
    const result = await workerStore.sendHttpTaskAsync(task, httpWorkerType.value, 'httpRequest', false);
    console.log('HTTP Task Result:', result);
    $q.notify({
      type: 'positive',
      message: 'Запрос успешно выполнен!',
    });
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Ошибка: ${error.message}`,
    });
  } finally {
    loading.value = false;
    activeTab.value = 'http';
  }
}

function saveWorkerConfig() {
  const originalConfig = { ...workerConfig.value };
  workerStore.updateWorkerConfig(workerConfig.value);

  // Check if any counts were adjusted due to validation
  const adjusted = Object.keys(originalConfig).some(
    key => originalConfig[key] !== workerConfig.value[key]
  );
  if (adjusted) {
    $q.notify({
      type: 'warning',
      message: 'Некоторые значения воркеров были скорректированы до минимального (1).',
    });
  } else {
    $q.notify({
      type: 'positive',
      message: 'Конфигурация воркеров обновлена.',
    });
  }
}

onMounted(() => {
  workerStore.initPools();
});
</script>

<style scoped>
.fixed-top-buttons {
  position: sticky;
  top: 20px;
  z-index: 10;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.fixed-tabs {
  position: sticky;
  top: 140px;
  z-index: 9;
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

.card-style {
  min-width: 280px;
  padding: 16px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.stats {
  font-size: 0.9em;
  color: #666;
  margin-top: 10px;
}

.result-scrollable {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  padding: 10px 0;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  width: 100%;
  max-width: 1100px;
  word-break: break-word;
  font-family: monospace;
  font-size: 14px;
  background-color: #f9f9f9;
}

.error-card {
  border: 1px solid red;
  background-color: #ffe6e6;
}

.no-results {
  color: gray;
  font-style: italic;
}
</style>
