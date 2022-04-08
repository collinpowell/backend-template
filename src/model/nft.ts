import { model, Schema } from "mongoose";

export interface nftInput {
  files: [string];
  title: string;
  description?: string;
  nftCategory: number;
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
  ownerId: String,
  title: {
    type: String,
    required: true,
  },
  nftCategory: {
    type: Number,
    required: true,
  },
  formOfSale: {
    type: String,
    enum: ["AUCTION", "NOT_FOR_SALE", "FIXEDPRICE"],
  },
  contractType: {
    type: String,
    enum: ["ERC721", "ERC1155"],
    default: "ERC721",
  },
  totalLike: Number,
  contractAddress: { type: String },
  files: String,
  saleCoin: { type: Number },
  mintNft: { type: Number },
  fixedPrice: { type: String },
  creatorId: String,
  images: String,
  description: { type: String },
  royalty: [{ _id: false, percentage: Number, walletAddress: String }],
  properties: [
    { _id: false, key: String, value: String },
  ],
  status: { type: String, enum: ["ACTIVE", "DELETED"], default: "ACTIVE" },
  mintResponse: { type: Object },
};

const nftSchema = new Schema(schema, { timestamps: true});

export default model("nft", nftSchema);
