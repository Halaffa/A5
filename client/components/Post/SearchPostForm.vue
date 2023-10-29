<script setup lang="ts">
import { ref } from "vue";

const author = ref("");
const emit = defineEmits(["getPostsByAuthor"]);
</script>

<template>
  <form @submit.prevent="emit('getPostsByAuthor', author)" class="pure-form">
    <fieldset>
      <legend>Search by Author</legend>
      <input id="author" type="text" v-model="author" placeholder="Username" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
/* #171f22, #86cc48, #9e521e, #d2971f */
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
button {
  background-color: #86cc48;
}
input {
  border-width: 0cap;
  border-radius: 4px;
  padding: 0.5em;
  color: #171f22;
}
::placeholder {
  color: #171f22;
}
</style>
