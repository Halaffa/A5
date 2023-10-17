<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import MarkingsComponent from "./MarkingsComponent.vue";
import LoginFormVue from "../Login/LoginForm.vue";
import SearchUserForm from "./SearchUserForm.vue";

const { isLoggedIn, currentUsername } = storeToRefs(useUserStore());

const loaded = ref(false);
let users = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchUser = ref("");
let selectedUser = ref("");


const markings = ref([
    {
      name: "Smile",
      toggled: false,
    },
    {
      name: "Sad",
      toggled: false,
    },
    {
      name: "Heart",
      toggled: false,
    },
    {
      name: "Angry",
      toggled: false,
    }
  ]);

function markLabel(name: string, from: ObjectId, to: ObjectId) {
  return to.toString() + "_" + name + "_" + from.toString();
}

async function handleMarkToggle(name, toggle) {
  currentUser = await fetchy(`/api/users/:${currentUsername}`, "GET", {});
  labels = await fetchy("/api/labels", "GET");
  labelNames = labels.map((label) => label.name);
  outLabel = markLabel(name, currentUser, selectedUser);
  markExists = labelNames.contains(outLabel);
  if (markExists) {
    matchingLabel = labels[0];
    for (label of labels) {
      if (label.name == outLabel) {
        matchingLabel = label;
        break;
      }
    }
    await fetchy("/api/labels", "DELETE", {body: {_id: matchingLabel._id} });
    return;
  }
  await fetchy("/api/labels", "POST", {body: {name: outLabel, target: selectedUser} });
}

async function getUsers(user?: string) {
  let userResults;
  if (user === undefined){
    try {
      userResults = await fetchy("/api/users", "GET", {});
    } catch (_) {
      return;
    }
  } 
  else {
    try {
      userResults = await fetchy(`/api/users/:${user}`, "GET", {});
    } catch (_) {
      return;
    }
  }
  searchUser.value = user ? user : "";
  users.value = userResults;
}


onBeforeMount(async () => {
  await getUsers();
  loaded.value = true;
});
</script>

<template>
  <div>
    <h2 v-if="!searchUser" justify-content="center">Users:</h2>
    <h2 v-else>Users with name: {{ searchUser }}:</h2>
    <SearchUserForm/>
  </div>
  <section v-if="loaded && users.length !== 0">
    <article v-for="user in users" :key="user._id">
      <button v-on:click="event => selectedUser = user._id">{{user.username}}</button>
    </article>
  </section>
  <p v-else-if="loaded">No users could be found. Try a different name.</p>
  <p v-else>Loading...</p>
  <section v-if="isLoggedIn">
    <h2>Choose your markings for {{selectedUser}}!</h2>
    <MarkingsComponent v-for="mark in markings"
    v-bind="mark" v-on:toggleMark="handleMarkToggle" />
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
