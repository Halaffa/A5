<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { computed, ref } from "vue";

const { loginUser, updateSession } = useUserStore();
const marks = ["smile", "sad", "angry", "love"];
const emit = defineEmits(["markToggle"]);
const props = defineProps(['name', 'toggled', 'mutual']);
let toggled = ref(props.toggled);
// let rgb = ref('rgb(200, 200, 200)');
let rgb = computed(() => {
  if (props.toggled) {
    return 'rgb(200, 20, 170)';
  }
  else {
    return 'rgb(200, 200, 200)';
  }
});
let bkg = computed(() => {
  if (props.mutual) {
    return 'rgb(20, 210, 40)'
  }
  else {
    return 'rgb(220, 220, 220)'
  }
})

function toggleMark() {
  toggled.value = !toggled.value;
  emit("markToggle", props.name);
}

</script>

<template>
  <button v-on:click="toggleMark" v-bind:style="{ color: rgb!, backgroundColor: bkg! }">{{ props.name }}</button>
  <!-- <div v-if="toggled">
    
  </div>
  <div v-else>
    <p v-on:click="toggleMark" color="blue" v-bind="toggled">{{props.name}}</p>
  </div> -->
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
