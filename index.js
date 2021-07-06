const { Client, MessageEmbed } = require("discord.js");
const dotenv = require("dotenv").config();
const config = require("./config");
const commands = require("./help");
const logger = require("./src/logger");
const onMessage = require("./src/events/onMessage");

const { debug = false } = config;

const client = new Client();

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag} on ${new Date(Date.now())}.`);
  logger.log("info", `bot started`);
  // let channel = await bot.channels.fetch('525749396696989699');
  // channel.send('<:jonnnnn:829581695685623829>`Jonnnnn` climbed from 42 to 32. payout in `02:33`');
});

client.on("message", async (message) => {
  onMessage(message, client);
});

require("./server")();
client.login(config.token);
