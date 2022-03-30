import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = {
  bidId: {
    type: String,
    default: uuidv4,
    index: true,
  },
  artWorkId: String,
  saleCoin: { type: Number },
  salePrice: { type: String },
  userId: String,
  transactionHash: Object,
  isDeleted: { type: Boolean, default: false },
  auctionEnded: { type: Boolean, default: false },
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const biddingSchema = new Schema(schema, { timestamps });

export default model("bid", biddingSchema);
