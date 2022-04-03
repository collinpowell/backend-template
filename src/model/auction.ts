import { model, Schema } from "mongoose";

const schema = {
  ownerID: String,
  nftId: String,
  auctionEndHours: { type: Number },
  auctionEndTime: { type: Date },
  auctionStartPrice: { type: String },
  auctionEnded: { type: Boolean, default: false },
};

const auctionSchema = new Schema(schema, { timestamps:true });

export default model("auction", auctionSchema);
