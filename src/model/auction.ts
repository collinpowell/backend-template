import { model, Schema } from "mongoose";

export interface AuctionData {
  _id: String;
  ownerId: String,
  nftId: String,
  auctionEndHours: Date ,
  auctionEndTime: Date,
  auctionStartPrice: String,
  auctionEnded: Boolean,
  createdAt: String;
  updatedAt: String;
}

const schema = {
  ownerId: String,
  nftId: String,
  auctionEndHours: { type: Number },
  auctionEndTime: { type: Date },
  auctionStartPrice: { type: String },
  auctionEnded: { type: Boolean, default: false },
};

const auctionSchema = new Schema(schema, {
  toObject: { getters: true },
  toJSON: { getters: true },
  timestamps: true
});

export default model<AuctionData>("auction", auctionSchema);
