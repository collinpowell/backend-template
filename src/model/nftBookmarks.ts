import { model, Schema } from "mongoose";

const schema = {
  nftId: String,
  bookmarked: { type: Boolean, default: false },
  userId: String,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const nftLikeSchema = new Schema(schema, { timestamps });

export default model("nft_like", nftLikeSchema);
