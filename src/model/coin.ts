import { model, Schema } from "mongoose";

const schema = {
  coins: [{ _id: false, id: Number, coinName: String }],
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const coinSchema = new Schema(schema, { timestamps });

export default model("coin", coinSchema);
