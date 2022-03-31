import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

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
  creator: [Object],
  isDeleted: { type: Boolean, default: false },
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const collectionSchema = new Schema(schema, { timestamps });

export default model("collection", collectionSchema);
