<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import MarkingsComponent from "./MarkingsComponent.vue";
import LoginFormVue from "../Login/LoginForm.vue";
import SearchUserForm from "./SearchUserForm.vue";

const { isLoggedIn, currentUsername, currentUserId } = storeToRefs(useUserStore());

const loaded = ref(false);
let users = ref<Array<Record<string, string>>>([]);
let editing = ref("");
let searchUser = ref("");
let selectedUser = ref({username: "no one", _id: null});
let debugMsg = ref("No feedback yet");

const markNames = ["Smile", "Sad", "Heart", "Angry"];

let markings = ref([
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
  let labels = [];
  try {
    labels = await fetchy("/api/labels", "GET", {});
  } catch (_) {
    const testUser = {username: "filler", _id: "bob"};
    selectedUser.value = testUser; 
  }
  debugMsg.value = `fetched labels, first is ${labels[0]}`;
  const labelNames = labels.map((label) => label.name);
  debugMsg.value = `fetched labels, first name is ${labelNames[0]}`;
  // currentUser = await fetchy(`/api/users/:${currentUsername}`, "GET", {});
  debugMsg.value = `The currentUser is ${currentUserId}`;

  const outLabel = markLabel(name, currentUserId, selectedUser.value._id);
  // debugMsg.value = `The markLabel executed`;
  const markExists = labelNames.includes(outLabel);
  // debugMsg.value = `The mark doesn't exist`;
  if (markExists) {
    matchingLabel = labels[0];
    for (label of labels) {
      if (label.name == outLabel) {
        matchingLabel = label;
        break;
      }
    }
    await fetchy("/api/labels", "DELETE", {body: {_id: matchingLabel._id} });
  }
  else {
    await fetchy("/api/labels", "POST", {body: {name: outLabel, target: selectedUser.value._id} });
  }
  const newMarkings = [];
  for (mark of markNames){
    debugMsg.value = "Can iterate over markNames!";
    outLabel = markLabel(mark, currentUser.value, selectedUser.value._id);
    newMarkings.push({name: mark, toggled: labelNames.includes(outLabel)})
  }
  // debugMsg.value = "handleMarkToggle is executing!";
  // newMarkings = [];
  // for (mark of markNames){
  //   debugMsg.value = "Can iterate over markNames!";
  //   outLabel = markLabel(mark, currentUser.value, selectedUser.value._id);
  //   isToggled = mark.toggled;
  //   if (mark.name === name) {
  //     isToggled = toggle;
  //   }
  //   newMarkings.push({name: mark.name, toggled: isToggled});
  // }
  // for (mark of markings.value) {
  //   debugMsg.value = "markings.value is an iterable!";
  //   // It's not?!
  //   if (mark.name === name) {
  //     mark.toggled = toggle;
  //     break;
  //   }
  // }
  // debugMsg.value = "passed first for loop!";
  // debugMsg.value = "currentUser is: " + currentUsername.value;
  // currentUser = await fetchy(`/api/users/:${currentUsername.value}`, "GET", {});
  // debugMsg.value = "fetched the user";
  // labels = await fetchy("/api/labels", "GET", {});
  // labelNames = labels.map((label) => label.name);
  
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

async function selectUser(user) {
  let labels = [];
  debugMsg.value = "selectUser is executing!";
  selectedUser.value = user; 
  try {
    labels = await fetchy("/api/labels", "GET", {});
  } catch (_) {
    const testUser = {username: "filler", _id: "bob"};
    selectedUser.value = testUser; 
  }
  
  // userLabels = labels.filter((label) => label.target == selectedUser);
  labelNames = labels.map((label) => label.name);
  newMarkings = [];
  for (mark of markings.value){
    outLabel = markLabel(mark.name, currentUser.value, selectedUser.value._id);
    newMarkings.push({name: mark.name, toggled: labelNames.includes(outLabel)})
  }
  
  markings.value = newMarkings;
  return user.value;
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
      <button v-on:click="selectUser(user)">{{user.username}}</button>
    </article>
  </section>
  <p v-else-if="loaded">No users could be found. Try a different name.</p>
  <p v-else>Loading...</p>
  <section v-if="isLoggedIn">
    <h2>Choose your markings for {{selectedUser.username}}!</h2>
    <MarkingsComponent v-for="mark in markings" v-bind="mark"
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
