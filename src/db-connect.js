const { database_url } = require("../config");
const rank = require("../models/rank");
const GuildDatabase = require("./guild-database");

module.exports = new GuildDatabase(database_url, rank);
