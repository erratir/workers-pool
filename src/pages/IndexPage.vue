<!-- src/pages/IndexPage.vue-->
<template>
  <q-page class="flex flex-center column q-pa-md">
    <q-btn label="Отправить запрос" @click="sendRequest" color="primary" :loading="loading" />

    <div v-if="results.length" class="q-mt-md">
      <h5>Результаты:</h5>
      <pre v-for="(result, i) in results" :key="i" class="result-item">
        {{ JSON.stringify(result, null, 2) }}
      </pre>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useWorkerStore } from 'src/stores/workerStore';

const workerStore = useWorkerStore();
const loading = ref(false);
const results = ref([]);

// Подписываемся на обновления через watcher
workerStore.$subscribe((mutation, state) => {
  // Предположим, что вы хотите хранить результаты в store
  if (state.results) {
    results.value = [...state.results];
  }
});

function sendRequest() {
  loading.value = true;
  console.log('Отправляем задачу в воркер');

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
.result-item {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 6px;
  max-width: 600px;
  overflow-x: auto;
}
</style>
