import { model, Schema } from "mongoose";

const schema = {
  nftId: String,
  userId: String,
  auctionId:{ type:String},
  saleCoin: { type: Number },
  bidAmount: { type: String },
  bidderAddress: { type: String },
  bidderId: String,
  transactionHash: String,
  status: { type: String, enum: ["BID","ALLOTED","REFUNDED","REJECTED"], default: "BID" },
};

const biddingSchema = new Schema(schema, { timestamps: true});

export default model("bid", biddingSchema);
