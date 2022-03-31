import { model, Schema } from "mongoose";

const schema = {
  auctionID: String,
  nftID: String,
  saleCoin: { type: Number },
  bidAmount: { type: String },
  bidderID: String,
  transactionHash: Object,
  status: { type: String, enum: ["BID","ALLOTED","REFUNDED"], default: "BID" },
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const biddingSchema = new Schema(schema, { timestamps });

export default model("bid", biddingSchema);
