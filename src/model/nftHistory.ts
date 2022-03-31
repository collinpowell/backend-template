import { model, Schema } from "mongoose";

const schema = {
    userId: String,
    nftId: String,
    typeOfEvent: {
        type: String,
        enum: ["MINTED","LIKED","PURCHASED","BURNED","PUT_ON_AUCTION","WON_AUCTION"],
        default: "MINTED",
    },
    meta: [Object]
};
const timestamps = { createdAt: "created_at"};

const ownerHistorySchema = new Schema(schema, { timestamps });

export default model("owner_history", ownerHistorySchema);
