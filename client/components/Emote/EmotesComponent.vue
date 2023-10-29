<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn, currentUsername, currentUserId } = storeToRefs(useUserStore());

const loaded = ref(false);

//v-bind:style="{ background: 'rgb(0, 0, 0)' }"

const debugMsg = ref("No feedback yet");

const emotes = [":)", ":(", ":<", ":O"];

const myEmote = ref("loading");

async function handleEmoteChange() {
  console.log(currentUsername);
  await fetchy(`/api/user/status/${myEmote.value}/${currentUsername.value}`, "POST", {});
  debugMsg.value = myEmote.value;
  return;
}


async function getEmote() {
  console.log(currentUsername);
  const emote = await fetchy(`/api/user/status/id/${currentUsername.value}`, "GET");
  myEmote.value = emote.emoji;
  debugMsg.value = emote.emoji;
  return;
}

onBeforeMount(async () => {
  await getEmote();
  loaded.value = true;
  debugMsg.value = "Loaded!";
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Current Emote: {{ myEmote }}</h2>
    <h2>Choose from the emotes below:</h2>
    <div v-for="emote in emotes">
      <div v-if="emote==myEmote">
        <button v-on:click="event => {myEmote = emote; handleEmoteChange()}"
          v-bind:style="{background: 'rgb(10, 210, 20)'}">
          {{ emote }}
        </button>
      </div>
      <div v-else>
        <button v-on:click="event => {myEmote = emote; handleEmoteChange()}">
          {{ emote }}
        </button>
      </div>
    </div>
  </section>
  <section v-else>
    <h2>Please log in!</h2>
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
