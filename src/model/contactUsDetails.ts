import { model, Schema } from "mongoose";

export interface ContactUsDetails {
  email: String;
  subject: String;
  name: String;
  message: String;
}

const schema = {
  message: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  subject: { type: String, required: true },
};
const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };


const contactUsSchema = new Schema(schema, { timestamps });

export default model<ContactUsDetails>("contactUsDetails", contactUsSchema);
