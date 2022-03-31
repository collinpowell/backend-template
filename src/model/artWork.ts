import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ArtWorkInput {
  files: [string];
  title: string;
  description?: string;
  artWorkCategory: number;
  formOfSale: string;
  saleCoin?: number;
  type: number;
  fixedPrice?: string;
  auctionEndHours?: number;
  auctionStartPrice?: string;
  royalty: string;
  properties: string;
  mintResponse: any;
  mintNft?: number;
  images?: [string];
}


export interface Royalty {
  percentage: number;
  walletAddress: string;
}

export interface FileTypes {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

const schema = {
  userId: String,
  title: {
    type: String,
    required: true,
  },
  artWorkCategory: {
    type: Number,
    required: true,
  },
  formOfSale: {
    type: String,
    enum: ["auction", "fixedsale", "not_for_sale"],
  },

  contractType: {
    type: String,
    enum: ["ERC721", "ERC1155"],
    default: "ERC721",
  },
  contractAddress: { type: String },
  files: String,
  saleCoin: { type: Number },
  mintNft: { type: Number },
  fixedPrice: { type: String },
  auctionEndHours: { type: Number },
  auctionEndTime: { type: Date },
  auctionStartPrice: { type: String },
  currentOwnerId: String,
  images: String,
  description: { type: String },
  royalty: [{ _id: false, percentage: Number, walletAddress: String }],
  properties: [
    { _id: false, key: String, value: String },
  ],
  mintResponse: { type: Object },
  sellingAvailable: { type: Boolean, default: true },
  nftToken: Object,
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const artWorkSchema = new Schema(schema, { timestamps });

export default model("artWork", artWorkSchema);
