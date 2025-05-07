<!-- src/pages/IndexPage.vue -->
<template>
  <q-page class="flex column q-pa-md">
    <div class="row justify-center q-gutter-md fixed-top-buttons">
      <!-- Первая карточка для HTTP-воркера -->
      <q-card class="col-md-5 col-sm-12 card-style">
        <q-card-section class="card-header">
          <div class="text-h6">HTTP-воркер</div>
          <q-icon name="info" color="primary" size="sm" class="q-ml-sm cursor-pointer" @click="showHttpDetails = true" />
        </q-card-section>
        <q-card-section>
          <q-input v-model="ip" label="IP или URL" />
          <q-input v-model.number="port" label="Порт" type="number" />
          <q-input v-model="username" label="Имя пользователя" />
          <q-input v-model="password" label="Пароль" type="password" />
          <q-btn label="Отправить запрос" @click="sendRequest" color="primary" :loading="loading" />
          <div class="stats">
            Задачи в очереди: {{ workerStore.httpWorkerStats.activeTasks }} / Всего воркеров: {{ workerStore.httpWorkerStats.total }} / Свободно: {{ workerStore.httpWorkerStats.free }}
          </div>
        </q-card-section>
      </q-card>

      <!-- Вторая карточка для Compute-воркера -->
      <q-card class="col-md-5 col-sm-12 card-style">
        <q-card-section class="card-header">
          <div class="text-h6">Compute-воркер (JS)</div>
          <q-icon name="info" color="secondary" size="sm" class="q-ml-sm cursor-pointer" @click="showComputeDetails = true" />
        </q-card-section>
        <q-card-section>
          <q-input v-model.number="number" label="Введите число для факториала" />
          <q-btn label="Выполнить вычисление" @click="runCompute" color="secondary" :loading="loading" />
          <div class="stats">
            Задачи в очереди: {{ workerStore.computeWorkerStats.activeTasks }} / Всего воркеров: {{ workerStore.computeWorkerStats.total }} / Свободно: {{ workerStore.computeWorkerStats.free }}
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Табы, закрепленные под карточками -->
    <div class="fixed-tabs">
      <q-tabs v-model="activeTab" dense class="text-teal" indicator-color="teal">
        <q-tab name="http" label="HTTP-запросы" />
        <q-tab name="compute" label="Вычисления" />
      </q-tabs>
    </div>

    <!-- Область результатов с прокруткой -->
    <div class="results-container">
      <q-tab-panels v-model="activeTab" animated>
        <!-- Вкладка для HTTP-запросов -->
        <q-tab-panel name="http" class="tab-panel">
          <div class="results-header">
            <h5>Результаты HTTP-запросов:</h5>
            <q-btn
              v-if="httpResults.length"
              label="Очистить"
              color="negative"
              size="sm"
              @click="workerStore.httpResults = []"
            />
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

        <!-- Вкладка для вычислений -->
        <q-tab-panel name="compute" class="tab-panel">
          <div class="results-header">
            <h5>Результаты вычислений:</h5>
            <q-btn
              v-if="computeResults.length"
              label="Очистить"
              color="negative"
              size="sm"
              @click="workerStore.computeResults = []"
            />
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
      </q-tab-panels>
    </div>

    <!-- Диалог для HTTP-воркера -->
    <q-dialog v-model="showHttpDetails">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Подробности HTTP-воркера</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>Выполняет http запросы с параметрами заданными пользователем</p>
          <p>Всего воркеров: {{ workerStore.httpWorkerStats.total }}</p>
          <p>Свободных воркеров: {{ workerStore.httpWorkerStats.free }}</p>
          <p>Занятых воркеров: {{ workerStore.httpWorkerStats.busy }}</p>
          <p>Задачи в очереди: {{ workerStore.httpWorkerStats.activeTasks }}</p>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Диалог для Compute-воркера -->
    <q-dialog v-model="showComputeDetails">
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Подробности Compute-воркера</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <p>Выполняет расчет факториала для числа заданного пользователем (ОЫ)</p>
          <p>Всего воркеров: {{ workerStore.computeWorkerStats.total }}</p>
          <p>Свободных воркеров: {{ workerStore.computeWorkerStats.free }}</p>
          <p>Занятых воркеров: {{ workerStore.computeWorkerStats.busy }}</p>
          <p>Задачи в очереди: {{ workerStore.computeWorkerStats.activeTasks }}</p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useWorkerStore } from 'src/stores/workerStore';

const workerStore = useWorkerStore();
const loading = ref(false);
const number = ref(1000);
const ip = ref('jsonplaceholder.typicode.com/todos/1');
const port = ref(443);
const username = ref('admin');
const password = ref('admin111');
const activeTab = ref('http'); // По умолчанию активна вкладка HTTP
const showHttpDetails = ref(false); // Управление диалогом для HTTP
const showComputeDetails = ref(false); // Управление диалогом для Compute

const httpResults = computed(() => workerStore.httpResults);
const computeResults = computed(() => workerStore.computeResults);

function runCompute() {
  loading.value = true;
  workerStore.sendComputeTask(number.value);
  loading.value = false;
  activeTab.value = 'compute'; // Переключаемся на вкладку вычислений
}

function sendRequest() {
  if (!ip.value || !port.value || !username.value || !password.value) {
    alert('Пожалуйста, заполните все поля для HTTP-запроса.');
    return;
  }

  loading.value = true;
  const task = {
    ip: ip.value,
    port: port.value,
    username: username.value,
    password: password.value,
  };
  workerStore.sendHttpTask(task);
  loading.value = false;
  activeTab.value = 'http'; // Переключаемся на вкладку HTTP
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
  top: 140px; /* Под карточками, с учетом их высоты */
  z-index: 9;
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #e0e0e0;
}

.card-style {
  min-width: 280px;
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  padding-bottom: 2px;
}

.results-container {
  flex: 1;
}

.tab-panel {
  padding: 0; /* Убираем внутренние отступы панели табов */
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
  max-height: calc(100vh - 240px); /* Высота минус карточки, табы и отступы */
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
