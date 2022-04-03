import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface FeeData {
  _id: string;
  feesId: string;
  fees: object;
  capacity: number;
  royalty: number;
  admin_fee: number;
  ip: [];
  usage: string;
}

export interface FeeInput {
  fees: object;
  capacity: number;
  royalty: number;
  adminFee: number;
  usage: string;
  ip: [];
}

const schema = {
  feesId: {
    type: String,
    default: uuidv4,
    index: true
  },
  fees: Object, // ? Platform fee, trasasction fee
  capacity: {
    type: Number
  },
  royalty: {
    type: Number
  },
  adminFee: {
    type: Number
  },
  usage: {
    type: String
  },
  ip: [
    {
      type: String
    }
  ]
};

const feeSchema = new Schema(schema, { timestamps : true});

export default model("fee", feeSchema);
