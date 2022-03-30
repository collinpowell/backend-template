import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ContactUsDetails {
  email: String;
  name: String;
  content: String;
  userId?: String;
}

const schema = {
  contactId: { type: String, default: uuidv4, index: true },
  userId: { type: String },
  content: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
};

const contactUsSchema = new Schema(schema);

export default model<ContactUsDetails>("contactUsDetails", contactUsSchema);
