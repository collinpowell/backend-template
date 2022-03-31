import { model, Schema } from "mongoose";

const schema = {
  nftId: String,
  bookmarked: { type: Boolean, default: false },
  userId: String,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const artWorkLikeSchema = new Schema(schema, { timestamps });

export default model("art_work_like", artWorkLikeSchema);
