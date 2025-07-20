import mongoose from "mongoose";

export const appSchema = new mongoose.Schema({
  name: String,
  svg: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
});

export const Application = mongoose.model("Application", appSchema);
