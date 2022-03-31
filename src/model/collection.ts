import { model, Schema } from "mongoose";

const schema = {
  userId: String,
  totalLike: Number,
  nftCount: Number,
  image:String,
  title: {
    type: String,
    required: true,
  },
  collectionData: [Object],
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const collectionSchema = new Schema(schema, { timestamps });

export default model("collection", collectionSchema);
