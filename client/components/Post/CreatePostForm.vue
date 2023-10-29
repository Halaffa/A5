<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const tier = ref("");
const warnTierType = ref("");
const emit = defineEmits(["refreshPosts"]);

const createPost = async (content: string, tier?: string) => {
  let parsedTier = 0;
  if (tier && tier !== ""){
    parsedTier = parseInt(tier);
    if (Number.isNaN(parsedTier)) {
      warnTierType.value = "Tier must be an integer (no decimals)";
      return;
    }
    else if (parsedTier < 0) {
      warnTierType.value = "Tier must be a nonnegative number";
      return;
    }
  }
  try {
    await fetchy(`/api/posts/${parsedTier}`, "POST", {
      body: { content }
    });
  } catch (_) {
    return;
  }
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
  tier.value = "";
  warnTierType.value = "";
};
</script>

<template>
  <form @submit.prevent="createPost(content, tier)">
    <label for="content">Post Contents:</label>
    <input id="tier" v-model="tier" placeholder="Tier this post to hide from lower tier users!"/>
    <textarea id="content" v-model="content" placeholder="Create a post!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
    <p>{{ warnTierType }}</p>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
