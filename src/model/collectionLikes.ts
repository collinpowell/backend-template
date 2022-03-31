import { model, Schema } from "mongoose";

const schema = {
  collectionId: String,
  liked: { type: Boolean, default: false },
  userId: String,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const collectionLikeSchema = new Schema(schema, { timestamps });

export default model("collection_like", collectionLikeSchema);
