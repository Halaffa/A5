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

function toggleMark() {
  toggled = !toggled;
  emit("markToggle", props.name, toggled);
}

</script>

<template>
  <div class="pure-control-group">
    <button v-on:click="toggleMark" >{{props.name}}</button>
  </div>
</template>

<style scoped>
h3 {
  display: flex;
  justify-content: center;
}
</style>
