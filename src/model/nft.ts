import { model, Schema } from "mongoose";

export interface NftInput {
  formOfSale: string;
  saleCoin: number;
  contractType: {
    type: String,
    enum: ["ERC721", "ERC1155"],
    default: "ERC721",
  };
  fixedPrice?: string;
  auctionEndHours?: number;
  auctionStartPrice?: string;
  royalty?: string;
  mintResponse: any;
  mintNft?: number;
  metaData: string;
  nftCategory: number;
}

export interface UploadInput {
  files: [string];
  title: string;
  description?: string;
  nftCategory: string;
  properties: any;
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


export interface Royalty {
  percentage: number;
  walletAddress: string;
}

const schema = {
  title: {
    type: String,
    required: true,
  },
  file: String,
  metadataUrl: String,
  description: { type: String },
  properties: [
    { _id: false, key: String, value: String },
  ],
  ownerId: String,
  creatorId: String,
  creatorAddress: String,
  ownerAddress: String,
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
  nftTokenId: Number,
  totalLike: Number,
  contractAddress: { type: String },
  saleCoin: { type: Number },
  mintNft: { type: Number },
  fixedPrice: { type: String },
  auctionId: { type: String },
  royalty: [{ _id: false, percentage: Number, walletAddress: String }],
  status: { type: String, enum: ["ACTIVE", "DELETED"], default: "ACTIVE" },
  mintResponse: { type: Object },
};

const nftSchema = new Schema(schema, { timestamps: true });

export default model("nft", nftSchema);

