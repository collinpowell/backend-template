import { model, Schema } from "mongoose";

export interface OneToOneEntryDetails {
  content: String;
  title: String;
  email: String;
}

const schema = {
  content: { type: String, required: true },
  title: { type: String, required: true },
  email: { type: String, required: true },
};

const oneToOneEntryDetailsSchema = new Schema(schema);

export default model<OneToOneEntryDetails>(
  "oneToOneEntryDetails",
  oneToOneEntryDetailsSchema
);
