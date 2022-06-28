import { model, Schema } from "mongoose";

export interface PrivacyPolicy {
  title: String;
  content: String;
}

const schema = { content: { type: String, required: true } };

const privacyPolicySchema = new Schema(schema);

export default model<PrivacyPolicy>("privacyPolicy", privacyPolicySchema);
