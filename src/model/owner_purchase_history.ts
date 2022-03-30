import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = {
  ownerHistoryId: {
    type: String,
    default: uuidv4,
    index: true,
  },
  coin: { type: Number },
  price: { type: String },
  userId: String,
  artWorkId: String,
  nftFileId: String,
  transactionHash: Object,
  nftTransfer: Object,
  currentOwnerAddress: String,
  creatorUserId: String,
  sellerUserId: String,
  purchaseType: String,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const ownerHistorySchema = new Schema(schema, { timestamps });

export default model("owner_history", ownerHistorySchema);
