import { model, Schema } from "mongoose";

const schema = {
  category: [{ _id: false, id: Number, categoryName: String,categoryImage: String }],
};

const categorySchema = new Schema(schema, { timestamps: true});

export default model("category", categorySchema);
