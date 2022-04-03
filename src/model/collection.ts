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
  status: { type: String, enum: ["ACTIVE", "INACTIVE","DELETED"], default: "ACTIVE" },
};

const collectionSchema = new Schema(schema, { timestamps: true });

export default model("collection", collectionSchema);
