import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = {
  artWorkLikeId: {
    type: String,
    default: uuidv4,
    index: true,
  },
  artWorkId: String,
  liked: { type: Boolean, default: false },
  userId: String,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const artWorkLikeSchema = new Schema(schema, { timestamps });

export default model("art_work_like", artWorkLikeSchema);
