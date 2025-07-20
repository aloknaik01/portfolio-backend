import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
  title: String,
  description: String,
  gitLink: String,
  projectLink: String,
  technologies: String,
  stack: String,
  deployed: String,
  projectBanner: {
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

export const Projects = mongoose.model("Projects", projectSchema);
