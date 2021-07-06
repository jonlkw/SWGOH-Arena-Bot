const mongoose = require("mongoose");

/**
 * Guild Database class, hosted on mongoDB and using mongoose schema.
 */
module.exports = class GuildDatabase {
  constructor(uri, model) {
    this._connect(uri);
    this.model = model;
  }

  /**
   * Connect to the database
   *
   * @param {string} uri link to mongoDB database
   */
  _connect(uri) {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));
  }

  /**
   * get data from the guild_id
   * @param {int} guild_id
   * @returns data from databse
   */
  async get(guild_id) {
    return this.model.findById(guild_id);
  }

  /**
   * Update the database with the new data.
   * @param {integer} guild_id
   * @param {object} data
   * @returns new data from database.
   */
  async set(guild_id, data) {
    let result = await this.model.findByIdAndUpdate(guild_id, data, {
      // overwrite: true,
      new: true,
    });

    if (!result) {
      result = new this.model(data);
      result._id = guild_id;
      await result.save();
    }

    //   await result.overwrite(guild).save();
    // console.log(data, result);

    return result;
  }
};

// (async () => {
//   const username = "admin";
//   const password = "lNO9sa2YoUrlPWvm";
//   const cluster_url = "cluster0.tc1li.mongodb.net";
//   const database = "test";

//   const uri = `mongodb+srv://${username}:${password}@${cluster_url}/${database}`;

//   const db = new GuildDatabase(uri);

//   const data = {
//     rank_table_message_id: "830738837168586803",
//     rank_table_channel_id: "525749396696989699",
//     rank_list: ["apple", "banana", "tomato"],
//   };

//   const guildId = "2";

//   console.log(db.Schema);

//   const res = await db.get(guildId);
//   console.log(res);
// })();

// const old = () => {
//   mongoose.connect(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });

//   const db = mongoose.connection;

//   db.on("error", console.error.bind(console, "connection error:"));

//   db.once("open", async () => {
//     // we're connected!
//     db.db.listCollections().toArray((err, names) => {
//       // console.log(names);
//     });

//     const guildSchema = new mongoose.Schema({
//       _id: Number,
//       rank_table_channel_id: Number,
//       rank_table_message_id: Number,
//       rank_list: Array,
//     });

//     const guildModel = mongoose.model("Guild", guildSchema);

//     const get = async (guild_id) => {
//       return guildModel.findById(guild_id);
//     };

//     const set = async (guild_id, data) => {
//       let result = await guildModel.findByIdAndUpdate(guiguild_iddId, data, {
//         // overwrite: true,
//         new: true,
//       });
//       if (!result) {
//         result = new guildModel(data);
//         result._id = guild_id;
//         await result.save();
//       }

//       //   await result.overwrite(guild).save();
//       console.log(result);

//       return result;
//     };

//     const data = {
//       rank_table_message_id: "830738837168586803",
//       rank_table_channel_id: "525749396696989699",
//       rank_list: ["apple", "banana", "tomato"],
//     };

//     const guildId = "2";

//     const res = await get(guildId);
//     console.log(res);

//     module.exports = { get, set };
//   });
// };
