import { model, Schema } from "mongoose";

export interface FreqAskedQuestion {
  question: String;
  answer: String;
  type: String;
}

const schema = {
  question: { type: String, required: true },
  answer: { type: String, required: true },
  type: { type: String, required: true },
};

const freqAskedQuestionsSchema = new Schema(schema);

export default model<FreqAskedQuestion>(
  "freqAskedQuestions",
  freqAskedQuestionsSchema
);
