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

const biddingSchema = new Schema(schema, { timestamps: true});

export default model("bid", biddingSchema);
