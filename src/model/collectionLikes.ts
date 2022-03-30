import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = {
  collectionLikeId: {
    type: String,
    default: uuidv4,
    index: true,
  },
  collectionId: String,
  liked: { type: Boolean, default: false },
  userId: String,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const collectionLikeSchema = new Schema(schema, { timestamps });

export default model("collection_like", collectionLikeSchema);
