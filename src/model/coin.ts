import { model, Schema } from "mongoose";

const schema = {
  coins: [{ _id: false, id: Number, coinName: String }],
};

const coinSchema = new Schema(schema, { timestamps: true});

export default model("coin", coinSchema);
