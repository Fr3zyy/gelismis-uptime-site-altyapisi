const mongoose = require("mongoose");
const Schema = mongoose.Schema

const blogSchema =  new Schema({
  "link": {
    type: String,
    require: true
  },
  "id": {
    type: String,
    require: true
  }})
const Blog = mongoose.model("uptime",blogSchema)
module.exports = Blog