import { model, Schema } from "mongoose";

const schema = {
  collectionId: String,
  liked: { type: Boolean, default: false },
  userId: String,
};

const collectionLikeSchema = new Schema(schema, { timestamps: true});

export default model("collectionLike", collectionLikeSchema);
