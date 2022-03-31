import { model, Schema } from "mongoose";

  const schema = {
    ownerID: String,
    auctionEndHours: { type: Number },
    auctionEndTime: { type: Date },
    auctionStartPrice: { type: String },
  };
  const timestamps = { createdAt: "created_at", updatedAt: "updated_at" };
  
  const auctionSchema = new Schema(schema, { timestamps });
  
  export default model("auction", auctionSchema);
  