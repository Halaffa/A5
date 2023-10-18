<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import MarkingsComponent from "./MarkingsComponent.vue";
import LoginFormVue from "../Login/LoginForm.vue";
import SearchUserForm from "./SearchUserForm.vue";

const { loginUser, updateSession } = useUserStore();
const marks = ["smile", "sad", "angry", "love"];
const emit = defineEmits(["markToggle"]);
const props = defineProps(['name', 'toggled']);
let toggled = ref(props.toggled);
let rgb = ref('rgb(200, 200, 200)');

function toggleMark() {
  toggled = !toggled;
  if (!toggled) {
    rgb.value = 'rgb(200, 200, 200)';
  }
  else {
    rgb.value = 'rgb(200, 20, 170)';
  }
  emit("markToggle", props.name, toggled);
}

</script>

<template>
  <button v-on:click="toggleMark" v-bind:style="{color: rgb}">{{props.name}}</button>
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
