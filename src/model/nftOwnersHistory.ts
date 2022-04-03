import { model, Schema } from "mongoose";

const schema = {
  coin: { type: Number },
  price: { type: String },
  userId: String,
  nftId: String,
  nftFileId: String,
  transactionHash: Object,
  nftTransfer: Object,
  currentOwnerAddress: String,
  creatorUserId: String,
  sellerUserId: String,
  purchaseType: String,
};

const ownerHistorySchema = new Schema(schema, { timestamps: true});

export default model("owner_history", ownerHistorySchema);
