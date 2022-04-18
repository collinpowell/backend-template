import { model, Schema } from "mongoose";

const schema = {
  nftId: String,
  saleCoin: { type: Number },
  bidAmount: { type: String },
  bidderId: String,
  transactionHash: Object,
  auctionEnded:{ type:Boolean, default: false},
  status: { type: String, enum: ["BID","ALLOTED","REFUNDED"], default: "BID" },
};

const biddingSchema = new Schema(schema, { timestamps: true});

export default model("bid", biddingSchema);
