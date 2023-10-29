import { Filter, ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface StatusDoc extends BaseDoc {
  user: ObjectId;
  emoji: string;
}

export default class StatusConcept {
  public readonly status = new DocCollection<StatusDoc>("status");

  async create(user: ObjectId) {
    if (!user) {
      throw new BadValuesError("user cannot be empty");
    }
    await this.status.createOne({ user, emoji: ":)" });
    return { msg: "Status field successfully created!" };
  }

  async getStatus(query: Filter<StatusDoc>) {
    const status = await this.status.readMany(query, {
      sort: { dateUpdated: -1 },
    });
    return status;
  }

  async getByAuthor(user: ObjectId) {
    const statuses = await this.status.readMany({ user: user });
    if (statuses.length === 0) {
      return { user: null, emoji: "none", _id: null };
    }
    return statuses[0];
  }

  async update(user: ObjectId, emoji: string) {
    const update = { emoji };
    this.sanitizeUpdate(update);
    // await this.getByAuthor(user);
    console.log(user);

    await this.status.updateOne({ user }, update);
    return { msg: "Status successfully updated!" };
  }

  async delete(user: ObjectId) {
    await this.getByAuthor(user);
    await this.update(user, "none");
    return { msg: "Status deleted successfully!" };
  }

  async isAuthor(user: ObjectId, _id: ObjectId) {
    const status = await this.status.readOne({ _id });
    if (!status) {
      throw new NotFoundError(`Status ${_id} does not exist!`);
    }
    if (status.user.toString() !== user.toString()) {
      throw new StatusUserNotMatchError(user, _id);
    }
  }

  private sanitizeUpdate(update: Partial<StatusDoc>) {
    // Make sure the update cannot change the author.
    const allowedUpdates = ["emoji"];
    for (const key in update) {
      if (!allowedUpdates.includes(key)) {
        throw new NotAllowedError(`Cannot update '${key}' field!`);
      }
    }
  }
}

export class StatusUserNotMatchError extends NotAllowedError {
  constructor(
    public readonly user: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the user of status {1}!", user, _id);
  }
}
