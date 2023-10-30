import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Expiry, Friend, Label, Permission, Post, Status, User, WebSession } from "./app";
import { convertLabelToInfo, markLabel, tierLabel } from "./concepts/label";
import { PostDoc } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

const LOGIN_TIMEOUT = 60 * 60 * 24;
const MARKS = ["Smile", "Angry", "Heart", "Sad"];

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/labels")
  async getAllLabels() {
    return await Label.getLabels({});
  }

  @Router.get("/expire/:resource/:type")
  async getExpireTime(resource: string, type: string) {
    let objectId = null;
    if (type == "status") {
      const userId = (await User.getUserByUsername(resource))._id;
      objectId = (await Status.getByAuthor(userId))._id;
    }
    if (!objectId) {
      throw new Error(`Given resource ${resource} does not exist of type ${type}`);
    }
    return await Expiry.getResourceTime(objectId);
  }

  @Router.get("/status")
  async getStatus() {
    return await Status.getStatus({});
  }

  @Router.get("/permission")
  async getPerms() {
    return await Permission.getPerms({});
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.post("/labels")
  async createLabel(name: string, target: ObjectId) {
    return await Label.create(name, target);
  }

  @Router.patch("/labels/:labelname/name/:newname")
  async changeLabel(labelname: string, name: string) {
    const label = await Label.getLabelByName(labelname);
    if (!label) {
      return;
    }
    const labelId = label._id;
    return await Label.update(labelId, name);
  }

  @Router.delete("/labels/:labelname")
  async deleteLabel(labelname: string) {
    const label = await Label.getLabelByName(labelname);
    if (!label) {
      return;
    }
    const labelId = label._id;
    return await Label.delete(labelId);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.patch("/expire/:object/:time/:type")
  async changeTime(object: string, time: string, type: string) {
    let objectId = null;
    if (type == "status") {
      const userId = (await User.getUserByUsername(object))._id;
      objectId = (await Status.getByAuthor(userId))._id;
    }
    if (!objectId) {
      throw new Error(`Given object ${object} does not exist of type ${type}`);
    }
    await Expiry.getTimeLeft(objectId);
    return await Expiry.refresh(objectId, parseInt(time));
  }

  @Router.post("/expire")
  async makeExpire(resource: ObjectId, time: number) {
    return await Expiry.create(resource, time);
  }

  @Router.get("/expired/:resource/:type")
  async didExpire(resource: string, type: string) {
    let objectId = null;
    if (type == "status") {
      const userId = (await User.getUserByUsername(resource))._id;
      objectId = (await Status.getByAuthor(userId))._id;
    }
    if (!objectId) {
      throw new Error(`Given resource ${resource} does not exist of type ${type}`);
    }
    return await Expiry.expire(objectId);
  }

  @Router.post("/permission")
  async grantPermission(user: ObjectId, resource: ObjectId) {
    return await Permission.grantPermission(user, resource);
  }

  @Router.get("/permission/:user")
  async getUserPerms(user: string) {
    const userId = (await User.getUserByUsername(user))._id;
    return await Permission.getByUser(userId);
  }

  @Router.get("/permission/resource/:resource/:type")
  async getAllowedUsers(resource: string, type: string) {
    let objectId = null;
    if (type === "post") {
      // Uh oh
    }
    if (type === "status") {
      const userId = (await User.getUserByUsername(resource))._id;
      objectId = (await Status.getByAuthor(userId))._id;
    }
    if (!objectId) {
      throw new Error(`Given resource ${resource} does not exist of type ${type}`);
    }
    return await Permission.getByResource(objectId);
  }

  @Router.get("/permission/user/:username/resource/:resource/:type")
  async getSpecificPerm(user: string, resource: string, type: string) {
    let objectId = null;
    const userId = (await User.getUserByUsername(user))._id;
    if (type === "post") {
      // Uh oh
    }
    if (type === "status") {
      objectId = (await Status.getByAuthor(userId))._id;
    }
    if (!objectId) {
      throw new Error(`Given resource ${resource} does not exist of type ${type}`);
    }
    return await Permission.getSpecific(userId, objectId);
  }

  @Router.delete("/permission/:user/:resource/:type")
  async revokePerm(user: string, resource: string, type: string) {
    let objectId = null;
    const userId = (await User.getUserByUsername(user))._id;
    if (type === "post") {
      // Uh oh
    }
    if (type === "status") {
      objectId = (await Status.getByAuthor(userId))._id;
    }
    if (!objectId) {
      throw new Error(`Given resource ${resource} does not exist of type ${type}`);
    }
    return await Permission.revokeSpecific(userId, objectId);
  }

  @Router.post("/status/:username")
  async initStatus(username: string) {
    const user = await User.getUserByUsername(username);
    return await Status.create(user._id);
  }

  @Router.get("/user/status/")
  async userStatus(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Status.getByAuthor(user);
  }

  @Router.get("/user/status/:username")
  async otherUserStatus(username: string) {
    console.log(username);
    const user = await User.getUserByUsername(username);
    console.log("user retrieved");
    return await Status.getByAuthor(user._id);
  }

  @Router.get("/user/status/id/:username")
  async otherUserIdStatus(username: string) {
    console.log(username);
    const user = await User.getUserByUsername(username);
    return await Status.getByAuthor(user._id);
  }

  @Router.get("/user/status/id/id/:username")
  async otherUserIdIdStatus(username: ObjectId) {
    console.log(username);
    return await Status.getByAuthor(username);
  }

  @Router.post("/user/status/:emoji/:username")
  async changeStatus(username: string, emoji: string) {
    const user = await User.getUserByUsername(username);
    return await Status.update(user._id, emoji);
  }

  @Router.delete("/user/status/")
  async deleteStatus(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Status.delete(user);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(session?: WebSessionDoc, author?: string) {
    let posts;
    const filteredPosts = [];
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    for (const post of posts) {
      if (post.options && post.options.tier && post.options.tier > 0) {
        continue;
      } else {
        filteredPosts.push(post);
      }
    }
    return Responses.posts(filteredPosts);
  }

  @Router.get("/posts/:user")
  async getPostsForUser(user: string, author?: string) {
    let posts;
    const filteredPosts = [];
    console.log("fetching posts...");
    const from = (await User.getUserByUsername(user))._id;
    const userID = from.toString();
    const labels = await Label.getLabels({ target: from });
    const tierLabels = labels.filter((input) => {
      return input.name.endsWith(userID);
    });
    const allUsers = await User.getUsers();
    const tieredUsers = new Map();
    for (const user of allUsers) {
      const userString = user._id.toString();
      for (const label of tierLabels) {
        if (label.name.startsWith(userString)) {
          const stringedNumber = convertLabelToInfo(label.name).info;
          // console.log(stringedNumber);
          const tier = parseInt(stringedNumber);
          // console.log(tier);
          if (!tier || Number.isNaN(tier)) {
            continue;
            //throw new Error("Could not parse label into a number for tiering.");
          }
          const usersOfTier = tieredUsers.get(tier);
          if (usersOfTier === undefined) {
            tieredUsers.set(tier, [user.username]);
          } else {
            usersOfTier.push(user.username);
            tieredUsers.set(tier, usersOfTier);
          }
          break;
        }
      }
    }
    const tiers = [];
    for (const KV of tieredUsers) {
      tiers.push([KV[0], KV[1]]);
    }
    tiers.sort((a, b) => b[0] - a[0]);
    console.log(tiers);
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    for (const post of posts) {
      let user = { username: "q" };
      try {
        const user = await User.getUserById(post.author);
      } catch (_) {
        continue;
      }
      if (post.options && post.options.tier) {
        if (tiers) {
          console.log(post.options.tier);
          for (const tieredUsers of tiers) {
            console.log(tieredUsers[0]);
            console.log(post.author);
            if (tieredUsers[0] < post.options.tier) {
              break;
            }
            if (tieredUsers[1].includes(user.username)) {
              filteredPosts.push(post);
              break;
            }
          }
        }
      } else {
        filteredPosts.push(post);
      }
    }
    return Responses.posts(filteredPosts);
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/mark/user/:to")
  async hasMarks(session: WebSessionDoc, to: string) {
    const from = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    const labelsPromise = MARKS.map(async (name) => {
      const labelName = markLabel(name, from, toId);
      return await Label.getLabels({ name: labelName, target: toId });
    });
    const labels = await Promise.all(labelsPromise);
    const bools = labels.map((label) => label.length > 0);
    const existingLabelNames = [];
    let count = 0;
    for (const bool of bools) {
      if (bool) {
        existingLabelNames.push(MARKS[count]);
      }
      count++;
    }
    return existingLabelNames;
  }

  // Useful for detecting mutual marking
  @Router.get("/mark/one/:to/:from/:name")
  async hasMark(session: WebSessionDoc, to: string, from: string, name: string) {
    const fromId = (await User.getUserByUsername(from))._id;
    const toId = (await User.getUserByUsername(to))._id;
    const labelName = markLabel(name, fromId, toId);
    const labels = await Label.getLabels({ name: labelName, target: toId });
    return labels.length > 0;
  }

  @Router.post("/mark/:to/:name")
  async mark(session: WebSessionDoc, to: string, name: string) {
    const from = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    const labelName = markLabel(name, from, toId);
    // Front-end task:
    // If from labeled to with label name already:
    //    Change some front end state to signify mutual marking
    return Label.create(labelName, toId);
  }

  @Router.delete("/mark/:to/:name")
  async unmark(session: WebSessionDoc, to: string, name: string) {
    const from = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    const labelName = markLabel(name, from, toId);
    const labels = await Label.getLabels({ name: labelName });
    const label = labels[0];
    //Front-end task:
    // If from labeled to with label name already:
    //    Change some state to signify no more mutual marking
    return Label.delete(label._id);
  }

  // This was not a functionality I realized I needed originally
  // This is so that all the labels that the current user has applied
  // can easily be found.
  @Router.get("/tier")
  async getTiers(session: WebSessionDoc) {
    const from = WebSession.getUser(session);
    const userID = from.toString();
    const labels = await Label.getLabels({ target: from });
    console.log("labels retrieved.");
    const tierLabels = labels.filter((input) => {
      return input.name.endsWith(userID);
    });
    const allUsers = await User.getUsers();
    const tieredUsers = new Map();
    for (const user of allUsers) {
      const userString = user._id.toString();
      for (const label of tierLabels) {
        if (label.name.startsWith(userString)) {
          const stringedNumber = convertLabelToInfo(label.name).info;
          // console.log(stringedNumber);
          const tier = parseInt(stringedNumber);
          // console.log(tier);
          if (!tier || Number.isNaN(tier)) {
            continue;
            //throw new Error("Could not parse label into a number for tiering.");
          }
          const usersOfTier = tieredUsers.get(tier);
          if (usersOfTier === undefined) {
            tieredUsers.set(tier, [user.username]);
          } else {
            usersOfTier.push(user.username);
            tieredUsers.set(tier, usersOfTier);
          }
          break;
        }
      }
    }
    console.log(tieredUsers);
    console.log(typeof tieredUsers);
    console.log(tieredUsers.get(1));
    const userLists = [];
    for (const KV of tieredUsers) {
      userLists.push([KV[0], KV[1]]);
    }
    console.log(userLists);
    userLists.sort((a, b) => b[0] - a[0]);
    return userLists;
  }

  // This was not a functionality I realized I needed originally
  // This is so that all the labels that the current user has applied
  // can easily be found.
  @Router.get("/tier/:username")
  async getTiersByUsername(username: string) {
    const from = (await User.getUserByUsername(username))._id;
    const userID = from.toString();
    const labels = await Label.getLabels({ target: from });
    console.log("labels retrieved.");
    const tierLabels = labels.filter((input) => {
      return input.name.endsWith(userID);
    });
    const allUsers = await User.getUsers();
    const tieredUsers = new Map();
    for (const user of allUsers) {
      const userString = user._id.toString();
      for (const label of tierLabels) {
        if (label.name.startsWith(userString)) {
          const stringedNumber = convertLabelToInfo(label.name).info;
          // console.log(stringedNumber);
          const tier = parseInt(stringedNumber);
          // console.log(tier);
          if (!tier || Number.isNaN(tier)) {
            continue;
            //throw new Error("Could not parse label into a number for tiering.");
          }
          const usersOfTier = tieredUsers.get(tier);
          if (usersOfTier === undefined) {
            tieredUsers.set(tier, [user.username]);
          } else {
            usersOfTier.push(user.username);
            tieredUsers.set(tier, usersOfTier);
          }
          break;
        }
      }
    }
    console.log(tieredUsers);
    console.log(typeof tieredUsers);
    console.log(tieredUsers.get(1));
    const userLists = [];
    for (const KV of tieredUsers) {
      userLists.push([KV[0], KV[1]]);
    }
    console.log(userLists);
    userLists.sort((a, b) => b[0] - a[0]);
    return userLists;
  }

  @Router.post("/tier/:otherUser/:number")
  async tier(session: WebSessionDoc, otherUser: string, number: string) {
    console.log("posting tier");
    const from = WebSession.getUser(session);
    const otherUserId = (await User.getUserByUsername(otherUser))._id;
    const tier: number = parseInt(number);
    const labelName = tierLabel(tier, from, otherUserId);
    const label = await Label.create(labelName, otherUserId);
    await Label.create(labelName, from);
    return label;
  }

  @Router.delete("/tier/:otherUser/:number")
  async untier(session: WebSessionDoc, otherUser: string, number: string) {
    const from = WebSession.getUser(session);
    const otherUserId = (await User.getUserByUsername(otherUser))._id;
    const tier: number = parseInt(number);
    const labelName = tierLabel(tier, from, otherUserId);
    const labels = await Label.getLabels({ name: labelName });
    const label = labels[0];
    const otherLabel = labels[1];
    await Label.delete(otherLabel._id);
    return Label.delete(label._id);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    const expireTimer = await Expiry.create(u._id, LOGIN_TIMEOUT);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/posts/:tier")
  async createPost(session: WebSessionDoc, content: string, tier?: number) {
    const user = WebSession.getUser(session);
    let options = undefined;
    if (tier !== 0) {
      options = { tier };
    }
    const created = await Post.create(user, content, options);
    // let labelName = "0";
    // if (tier) {
    //   labelName = tier.toString();
    // }
    // // Have to do this to let typescript compile
    // if (created) {
    //   const post = created.post;
    //   if (post) {
    //     await Label.create(labelName, post._id);
    //   }
    // }
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }
}

export default getExpressRouter(new Routes());
