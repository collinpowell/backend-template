import { model, Schema } from "mongoose";

export interface ContactUsDetails {
  email: String;
  subject: String;
  message: String;
}

const schema = {
  message: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
};

const contactUsSchema = new Schema(schema);

export default model<ContactUsDetails>("contactUsDetails", contactUsSchema);
