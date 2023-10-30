<script setup lang="ts">
import MarkComponent from "@/components/Mark/MarkComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Mark</h1>
    <section>
      <h1 v-if="isLoggedIn">Pick someone to apply a Mark to. Click to Mark, and click again to Unmark</h1>
      <h1 v-if="isLoggedIn">If the user has Marked you with the same Mark, it will turn green!</h1>
      <h1 v-else>Hey! You have to login to access this feature!</h1>
    </section>
    <MarkComponent/>
  </main>
</template>

<style scoped>
/* #171f22, #86cc48, #9e521e, #d2971f */
h1 {
  text-align: center;
  color: #171f22;
}

main {
  background-color:  #d2971f;
}
</style>
