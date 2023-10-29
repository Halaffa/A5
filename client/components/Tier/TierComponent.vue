<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchUserForm from "../SearchUserForm.vue";
import SingleTierComponent from "./SingleTierComponent.vue";

const { isLoggedIn, currentUsername, currentUserId } = storeToRefs(useUserStore());

const loaded = ref(false);
const users = ref<Array<Record<string, string>>>([]);
const searchUser = ref("");
const selectedUser = ref({username: "no one", _id: ""});
const tier = ref("");
const invalidTierMessage = ref("");
const debugMsg = ref("No feedback yet");
const tieredUsers = ref([]);

const labelledUsers = ref(new Map());

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
      userResults = await fetchy(`/api/users/${user}`, "GET", {});
      debugMsg.value = `Looking for user ${user}`;
    } catch (_) {
      return;
    }
  }
  searchUser.value = user ? user : "";
  users.value = userResults ? [userResults] : [];
}

async function selectUser(user: any) {
  selectedUser.value = user;
  return;
}

async function tierUser() {
  debugMsg.value = "tieringUser";
  // labelledUsers.value.forEach(async (key, value) => {
  //   debugMsg.value = "What";
  //   debugMsg.value = key.toString() +  "_" + value;
  //   if (value.endsWith(selectedUser.value.username)) {
  //     debugMsg.value = "deleting";
  //     await fetchy(`/api/tier/${selectedUser.value.username}/${key}`, "DELETE", {});
  //     debugMsg.value = "deleted";
  //   }
  // });
  const parsedTier = parseInt(tier.value);
  debugMsg.value = "parsed Int: " + parsedTier;
  if (Number.isNaN(parsedTier)) {
    invalidTierMessage.value = "Must be an integer (no decimals)";
  }
  else if (parsedTier < 0) {
    invalidTierMessage.value = "Must be a nonnegative number";
  }
  else {
    invalidTierMessage.value = "";
    if (parsedTier !== 0){
      debugMsg.value = "parsed Int: " + parsedTier + " username: " + selectedUser.value.username;
      await fetchy(`/api/tier/${selectedUser.value.username}/${tier.value}`, "POST", {});
    }
    await getTiers();
  }
  return;
}

async function getTiers() {
  const request = await fetchy(`/api/tier`, "GET", {});
  // debugMsg.value = request.get(1);
  //labelledUsers.value = request;
  //let debugMsgVal = "";
  // debugMsg.value = labelledUsers.value.size.toString();
  // for (const KV of labelledUsers.value) {
  //   debugMsgVal += KV[0].toString() + "_" + KV[1] + "_";
  // }
  // debugMsg.value = debugMsgVal;
  tieredUsers.value = request;
  return;
}

onBeforeMount(async () => {
  await getUsers();
  await getTiers();
  loaded.value = true;
});
</script>

<template>
  <div>
    <h2 v-if="!searchUser" justify-content="center">Users:</h2>
    <h2 v-else>Users with name: {{ searchUser }}:</h2>
    <SearchUserForm @getUserByUsername="getUsers"/>
  </div>
  <section v-if="loaded && users.length !== 0">
    <article v-for="user in users" :key="user._id">
      <button v-on:click="selectUser(user)">{{user.username}}</button>
    </article>
  </section>
  <p v-else-if="loaded">No users could be found. Try a different name.</p>
  <p v-else>Loading...</p>
  <section v-if="isLoggedIn">
    <h2>Choose your tier for {{selectedUser.username}}!</h2>
    <input id="tier" v-model="tier" placeholder="Enter positive int" />
    <button type="submit" class="pure-button pure-button-primary" v-on:click=tierUser>Change Tier</button>
    <p>{{ invalidTierMessage }}</p>
    <SingleTierComponent v-for="users in tieredUsers" :tier="users[0]" :users="users[1]" class="row"/>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

.pure-button {
  background-color: #86cc48;
}

button {
  background-color: #d2971f;
  border-color: #9e521e;
  border-radius: 3px;
  border-width: 3px;
  size: 100px;
  font-size: xx-large;
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
