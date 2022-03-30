import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = {
  coinId: {
    type: String,
    default: uuidv4,
    index: true,
  },
  coins: [{ _id: false, id: Number, coin_name: String }],
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const coinSchema = new Schema(schema, { timestamps });

export default model("coin", coinSchema);
