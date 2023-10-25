<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SearchUserForm from "../SearchUserForm.vue";
import MarkingsComponent from "./MarkingsComponent.vue";

const { isLoggedIn, currentUsername, currentUserId } = storeToRefs(useUserStore());

const loaded = ref(false);
const users = ref<Array<Record<string, string>>>([]);
const searchUser = ref("");
const selectedUser = ref({username: "no one", _id: ""});
const debugMsg = ref("No feedback yet");

const markings = ref([
    {
      name: "Smile",
      toggled: false,
      mutual: false,
    },
    {
      name: "Sad",
      toggled: false,
      mutual: false,
    },
    {
      name: "Heart",
      toggled: false,
      mutual: false,
    },
    {
      name: "Angry",
      toggled: false,
      mutual: false,
    }
  ]);

async function handleMarkToggle(name: string) {
  let isToggled = false;
  for (const mark of markings.value) {
    if (mark.name === name) {
      isToggled = mark.toggled;
      break;
    }
  }
  if (isToggled) {
    await fetchy(`/api/mark/${selectedUser.value.username}/${name}`, "DELETE", {});
  }
  else {
    await fetchy(`/api/mark/${selectedUser.value.username}/${name}`, "POST", {});
  }
  await selectUser(selectedUser.value);
  
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
  const labels = await fetchy(`/api/mark/user/${user.username}`, "GET", {});
  const stringify = labels.reduce((prev: string, next: string) => prev + "_" + next, "");
  debugMsg.value = stringify;
  selectedUser.value = user;
  const newMarkings = [];
  for (const mark of markings.value){
    let isMutual = false;
    const isMarked = labels.includes(mark.name);
    if (isMarked) {
      isMutual = await fetchy(`/api/mark/one/${currentUsername.value}/${user.username}/${mark.name}/`, "GET", {});
    }
    newMarkings.push({name: mark.name, toggled: isMarked, mutual: isMutual });
  }
  
  markings.value = newMarkings;
  return;
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
    <h2>Choose your markings for {{selectedUser.username}}!</h2>
    <MarkingsComponent v-for="mark in markings" :name="mark.name" :toggled="mark.toggled" :mutual="mark.mutual"
    @markToggle="handleMarkToggle"/>
  </section>
  <p>{{ debugMsg }}</p>
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
