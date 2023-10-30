<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

const { loginUser, updateSession } = useUserStore();
const props = defineProps(['tier', 'users']);
const debugMsg = ref("SingleTierComponent not done anything yet");

</script>

<template>
  <div>
    <p>Tier: {{props.tier}}</p>
    <p>Users: </p>
    <p v-for="user in props.users">{{ user }}</p>
  </div>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}
.toggled {
  color: blue;
  background-color: red;
}

p {
  margin: 3px;
}
</style>
