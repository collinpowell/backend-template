import { model, Schema } from "mongoose";

export interface HistoryType {
    userId: string,
    nftId: string,
    typeOfEvent: string,
    meta: any,
    timestamp: Date
  }
  

const schema = {
    userId: String,
    nftId: String,
    typeOfEvent: {
        type: String,
        enum: ["MINTED","LIKED","UNLIKED" ,"REMOVED_FROM_SALE","PURCHASED","BURNED","BIDDED_FOR","PUT_ON_FIXEDSALE","PUT_ON_AUCTION","WON_AUCTION"],
        default: "MINTED",
    },
    meta: Object,
    timestamp: Date
};

const ownerHistorySchema = new Schema(schema);

export default model("nftHistory", ownerHistorySchema);
