<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { computed, ref } from "vue";

const { loginUser, updateSession } = useUserStore();
const marks = ["smile", "sad", "angry", "love"];
const emit = defineEmits(["markToggle"]);
const props = defineProps(['name', 'toggled', 'mutual']);
let toggled = ref(props.toggled);
let rgb = computed(() => {
  if (props.toggled) {
    return '#9e521e';
  }
  else {
    return '#171f22';
  }
});
let bkg = computed(() => {
  if (props.mutual) {
    return '#86cc48'
    // return '0x86cc48'
  }
  else {
    return '#d2971f'
  }
})

function toggleMark() {
  toggled.value = !toggled.value;
  emit("markToggle", props.name);
}

</script>

<template>
  <button v-on:click="toggleMark" v-bind:style="{ color: rgb!, backgroundColor: bkg! }">{{ props.name }}</button>
</template>

<style scoped>
/* #171f22, #86cc48, #9e521e, #d2971f */
h3 {
  display: flex;
  justify-content: center;
}
.toggled {
  color: blue;
  background-color: red;
}

button {
  background-color: #d2971f;
  border-color: #9e521e;
  border-radius: 3px;
  border-width: 3px;
  size: 100px;
  font-size: xx-large;
}
</style>
