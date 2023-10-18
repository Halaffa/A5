import { defineStore } from "pinia";
import { computed, ref } from "vue";

import { BodyT, fetchy } from "@/utils/fetchy";

// import { ObjectId } from "mongodb";

export const useUserStore = defineStore(
  "user",
  () => {
    const currentUsername = ref("");

    // const currentUserId = ref(new ObjectId("6525fe489e1416c3b6e89652"));
    const currentUserId = ref("");

    const isLoggedIn = computed(() => currentUsername.value !== "");

    const resetStore = () => {
      currentUsername.value = "";
      // currentUserId.value = new ObjectId("6525fe489e1416c3b6e89652");
      const currentUserId = ref("");
    };

    const createUser = async (username: string, password: string) => {
      await fetchy("/api/users", "POST", {
        body: { username, password },
      });
    };

    const loginUser = async (username: string, password: string) => {
      await fetchy("/api/login", "POST", {
        body: { username, password },
      });
    };

    const updateSession = async () => {
      try {
        const { username, _id } = await fetchy("/api/session", "GET", { alert: false });
        currentUsername.value = username;
        currentUserId.value = _id;
      } catch {
        currentUsername.value = "";
        // currentUserId.value = new ObjectId("6525fe489e1416c3b6e89652");
        currentUserId.value = "";
      }
    };

    const logoutUser = async () => {
      await fetchy("/api/logout", "POST");
      resetStore();
    };

    const updateUser = async (patch: BodyT) => {
      await fetchy("/api/users", "PATCH", { body: { update: patch } });
    };

    const deleteUser = async () => {
      await fetchy("/api/users", "DELETE");
      resetStore();
    };

    return {
      currentUsername,
      currentUserId,
      isLoggedIn,
      createUser,
      loginUser,
      updateSession,
      logoutUser,
      updateUser,
      deleteUser,
    };
  },
  { persist: true },
);
