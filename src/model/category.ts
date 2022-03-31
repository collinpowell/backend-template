import { model, Schema } from "mongoose";

const schema = {
  category: [{ _id: false, id: Number, categoryName: String,categoryImage: String }],
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };

const categorySchema = new Schema(schema, { timestamps });

export default model("category", categorySchema);
