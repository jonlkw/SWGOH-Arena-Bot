const mongoose = require("mongoose");

const { Schema } = mongoose;

const rankSchema = new Schema({
  _id: String, // Discord IDs need to be stored as string because the integers are too high.
  rank_table_channel_id: String,
  rank_table_message_id: String,
  rank_list: Array,
});

const rank = mongoose.model("Rank", rankSchema);

module.exports = rank;
