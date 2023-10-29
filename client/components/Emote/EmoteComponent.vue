<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { computed, ref } from "vue";

const { loginUser, updateSession } = useUserStore();
const emit = defineEmits(["selectEmote"]);
const props = defineProps(['emote', 'selected']);

let bkg = computed(() => {
  if (props.selected) {
    return 'rgb(20, 210, 40)'
  }
  else {
    return 'rgb(220, 220, 220)'
  }
})

function selectEmote() {
  emit("selectEmote", props.name);
}

</script>

<template>
  <button v-on:click="toggleMark" v-bind:style="{ color: rgb!, backgroundColor: bkg! }">{{ props.name }}</button>
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
</style>
