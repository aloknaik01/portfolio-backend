import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  timeline: {
    from: String,
    to: String,
  },
});

export const Timeline = mongoose.model("Timeline", timelineSchema);
