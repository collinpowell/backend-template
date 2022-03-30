import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const schema = {
  categoryId: {
    type: String,
    default: uuidv4,
    index: true,
  },
  category: [{ _id: false, id: Number, category_name: String }],
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const categorySchema = new Schema(schema, { timestamps });

export default model("category", categorySchema);
