<template>
  <q-page class="flex column q-pa-md">
    <!-- Кнопки всегда вверху -->
    <div class="row justify-center q-gutter-md fixed-top-buttons">
      <!-- Первая карточка -->
      <q-card class="col-md-5 col-sm-12 card-style">
        <q-btn label="Отправить запрос" @click="sendRequest" color="primary" :loading="loading" />
      </q-card>

      <!-- Вторая карточка -->
      <q-card class="col-md-5 col-sm-12 card-style">
        <q-input v-model.number="number" label="Введите число для факториала" />
        <q-btn label="Выполнить вычисление" @click="runCompute" color="secondary" :loading="loading" />
      </q-card>
    </div>

    <!-- Область результатов -->
    <h5>Результаты:</h5>
    <div class="results-container q-mt-xs">
      <div v-if="filteredResults.length" class="result-list">
        <div v-for="(result, i) in filteredResults" :key="i" class="result-item">
          <q-card bordered class="result-card">
            <q-card-section>
              <pre>{{ JSON.stringify(result, null, 2) }}</pre>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else class="no-results">
        Нет выполненных задач.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useWorkerStore } from 'src/stores/workerStore';

const workerStore = useWorkerStore();
const loading = ref(false);
const number = ref(1000);
const results = ref([]);

// Подписываемся на обновления через watcher
workerStore.$subscribe((mutation, state) => {
  if (state.results) {
    results.value = [...state.results];
  }
});

// Фильтруем результаты по типу задачи
const filteredResults = computed(() => {
  return results.value.filter(result => result.meta?.type === 'http' || result.meta?.type === 'compute');
});

function runCompute() {
  loading.value = true;
  workerStore.sendComputeTask(number.value);
  loading.value = false;
}

function sendRequest() {
  loading.value = true;

  const task = {
    ip: "jsonplaceholder.typicode.com/todos/1",
    port: 443,
    username: "admin",
    password: "admin111"
  };

  workerStore.sendHttpTask(task);
  loading.value = false;
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.card-style {
  min-width: 280px;
  padding: 16px;
}

.results-container {
  flex: 1;
  overflow-y: auto;
  margin-top: 10px;
  max-height: calc(100vh - 160px); /* высота за вычетом кнопок */
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

.no-results {
  color: gray;
  font-style: italic;
}
</style>
