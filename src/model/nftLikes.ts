import { model, Schema } from "mongoose";

const schema = {
  nftId: String,
  liked: { type: Boolean, default: false },
  userId: String,
};

const nftLikeSchema = new Schema(schema, { timestamps:true });

export default model("nftLike", nftLikeSchema);
