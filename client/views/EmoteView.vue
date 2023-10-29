<script setup lang="ts">
import EmotesComponent from "@/components/Emote/EmotesComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Emotes!</h1>
    <section>
      <h1 v-if="isLoggedIn">Select an emote for {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <EmotesComponent />
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
