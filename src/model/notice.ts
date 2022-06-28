import { model, Schema } from "mongoose";

export interface Notice {
  content: String;
  title: String;
  views: Number;
  no: Number;
}

const schema = {
  title: { type: String, required: true },
  content: { type: String, required: true },
  views: { type: Number, required: true },
  no: { type: Number, required: true },
};

const noticeSchema = new Schema(schema, {
  timestamps: true,
});

export default model<Notice>("notice", noticeSchema);
