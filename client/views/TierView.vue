<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import TierComponent from "../components/Tier/TierComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Tier</h1>
    <section>
      <h1 v-if="isLoggedIn">Pick someone to Tier. Click to Select a user, then input a number to tier them.</h1>
      <h1 v-else>Hey! You have to login to access this feature!</h1>
    </section>
    <TierComponent/>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  color: #171f22;
}

main {
  background-color:  #d2971f;
}
</style>
